const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// All lot routes require authentication
router.use(authenticate);

// ── Validation rules ──────────────────────────────────────────────────────────

const lotValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').optional().trim(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('totalSpots').optional().isInt({ min: 0 }).withMessage('totalSpots must be a non-negative integer'),
  body('openTime').optional().matches(/^\d{2}:\d{2}$/).withMessage('openTime must be HH:MM'),
  body('closeTime').optional().matches(/^\d{2}:\d{2}$/).withMessage('closeTime must be HH:MM'),
  body('isActive').optional().isBoolean(),
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
    name:        row.name,
    address:     row.address,
    city:        row.city,
    latitude:    row.latitude  != null ? parseFloat(row.latitude)  : null,
    longitude:   row.longitude != null ? parseFloat(row.longitude) : null,
    totalSpots:  row.total_spots,
    openTime:    row.open_time,
    closeTime:   row.close_time,
    isActive:    row.is_active,
    createdBy:   row.created_by,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

// ── GET /api/lots ─────────────────────────────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM parking_lots ORDER BY created_at DESC'
    );
    res.json(result.rows.map(toDto));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/lots/:id ─────────────────────────────────────────────────────────

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM parking_lots WHERE id = $1',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Parking lot not found' });
    res.json(toDto(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/lots — admin only ───────────────────────────────────────────────

router.post('/', authorize('admin'), lotValidation, validate, async (req, res, next) => {
  const { name, address, city, latitude, longitude, totalSpots, openTime, closeTime, isActive } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO parking_lots
         (name, address, city, latitude, longitude, total_spots, open_time, close_time, is_active, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        name,
        address,
        city        ?? null,
        latitude    ?? null,
        longitude   ?? null,
        totalSpots  ?? 0,
        openTime    ?? null,
        closeTime   ?? null,
        isActive    ?? true,
        req.user.id,
      ]
    );
    res.status(201).json(toDto(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/lots/:id — admin only ────────────────────────────────────────────

router.put('/:id', authorize('admin'), lotValidation, validate, async (req, res, next) => {
  const { name, address, city, latitude, longitude, totalSpots, openTime, closeTime, isActive } = req.body;
  try {
    const result = await pool.query(
      `UPDATE parking_lots
       SET name=$1, address=$2, city=$3, latitude=$4, longitude=$5,
           total_spots=$6, open_time=$7, close_time=$8, is_active=$9
       WHERE id=$10
       RETURNING *`,
      [
        name,
        address,
        city        ?? null,
        latitude    ?? null,
        longitude   ?? null,
        totalSpots  ?? 0,
        openTime    ?? null,
        closeTime   ?? null,
        isActive    ?? true,
        req.params.id,
      ]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Parking lot not found' });
    res.json(toDto(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/lots/:id — admin only ─────────────────────────────────────────

router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM parking_lots WHERE id=$1 RETURNING id',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Parking lot not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
