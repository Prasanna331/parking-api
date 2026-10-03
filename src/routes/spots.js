const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const { emitSpotUpdate } = require('../services/socketService');

// All spot routes require authentication
router.use(authenticate);

// ── Validation ────────────────────────────────────────────────────────────────

const spotValidation = [
  body('lotId').notEmpty().withMessage('lotId is required'),
  body('spotNumber').trim().notEmpty().withMessage('spotNumber is required'),
  body('spotType')
    .optional()
    .isIn(['standard', 'handicapped', 'ev_charging', 'reserved', 'motorcycle'])
    .withMessage('Invalid spotType'),
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'reserved', 'maintenance'])
    .withMessage('Invalid status'),
  body('sensorId').optional().trim(),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
}

// ── Row → camelCase DTO ───────────────────────────────────────────────────────

function toDto(row) {
  return {
    id:          row.id,
    lotId:       row.lot_id,
    lotName:     row.lot_name ?? null,
    zoneId:      row.zone_id  ?? null,
    spotNumber:  row.spot_number,
    spotType:    row.spot_type,
    status:      row.status,
    sensorId:    row.sensor_id ?? null,
    lastUpdated: row.last_updated,
    createdAt:   row.created_at,
  };
}

// ── GET /api/spots?lotId=<uuid> ───────────────────────────────────────────────

router.get(
  '/',
  [query('lotId').optional().isUUID().withMessage('lotId must be a valid UUID')],
  validate,
  async (req, res, next) => {
    try {
      const { lotId } = req.query;
      const result = lotId
        ? await pool.query(
            `SELECT s.*, l.name AS lot_name
             FROM parking_spots s
             JOIN parking_lots l ON l.id = s.lot_id
             WHERE s.lot_id = $1
             ORDER BY s.spot_number`,
            [lotId]
          )
        : await pool.query(
            `SELECT s.*, l.name AS lot_name
             FROM parking_spots s
             JOIN parking_lots l ON l.id = s.lot_id
             ORDER BY l.name, s.spot_number`
          );
      res.json(result.rows.map(toDto));
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/spots/:id ────────────────────────────────────────────────────────

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT s.*, l.name AS lot_name
       FROM parking_spots s
       JOIN parking_lots l ON l.id = s.lot_id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Parking spot not found' });
    res.json(toDto(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/spots — admin only ──────────────────────────────────────────────

router.post('/', authorize('admin'), spotValidation, validate, async (req, res, next) => {
  const { lotId, spotNumber, spotType = 'standard', status = 'available', sensorId } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO parking_spots (lot_id, spot_number, spot_type, status, sensor_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [lotId, spotNumber, spotType, status, sensorId ?? null]
    );

    // Keep total_spots count in sync
    await pool.query(
      `UPDATE parking_lots
       SET total_spots = (SELECT COUNT(*) FROM parking_spots WHERE lot_id = $1)
       WHERE id = $1`,
      [lotId]
    );

    const spot = result.rows[0];
    const dto  = toDto(spot);
    emitSpotUpdate(lotId, dto);
    res.status(201).json(dto);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Spot number already exists in this lot' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ error: 'Parking lot not found' });
    }
    next(err);
  }
});

// ── PUT /api/spots/:id — admin only ──────────────────────────────────────────

router.put('/:id', authorize('admin'), spotValidation, validate, async (req, res, next) => {
  const { lotId, spotNumber, spotType = 'standard', status = 'available', sensorId } = req.body;
  try {
    const result = await pool.query(
      `UPDATE parking_spots
       SET lot_id=$1, spot_number=$2, spot_type=$3, status=$4, sensor_id=$5, last_updated=NOW()
       WHERE id=$6
       RETURNING *`,
      [lotId, spotNumber, spotType, status, sensorId ?? null, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Parking spot not found' });

    const dto = toDto(result.rows[0]);
    emitSpotUpdate(lotId, dto);
    res.json(dto);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Spot number already exists in this lot' });
    }
    next(err);
  }
});

// ── PATCH /api/spots/:id/status — admin or operator ──────────────────────────

router.patch(
  '/:id/status',
  authorize('admin', 'operator'),
  [body('status').isIn(['available', 'occupied', 'reserved', 'maintenance']).withMessage('Invalid status')],
  validate,
  async (req, res, next) => {
    const { status } = req.body;
    try {
      const result = await pool.query(
        `UPDATE parking_spots
         SET status=$1, last_updated=NOW()
         WHERE id=$2
         RETURNING *`,
        [status, req.params.id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: 'Parking spot not found' });

      const dto = toDto(result.rows[0]);
      emitSpotUpdate(dto.lotId, dto);
      res.json(dto);
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/spots/:id — admin only ───────────────────────────────────────

router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM parking_spots WHERE id=$1 RETURNING id, lot_id',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Parking spot not found' });

    const lotId = result.rows[0].lot_id;
    await pool.query(
      `UPDATE parking_lots
       SET total_spots = (SELECT COUNT(*) FROM parking_spots WHERE lot_id = $1)
       WHERE id = $1`,
      [lotId]
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
