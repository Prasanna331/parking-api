const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

// ── Helpers ──────────────────────────────────────────────────────────────────

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['admin', 'operator', 'viewer'])
      .withMessage('Role must be admin, operator, or viewer'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, password, role = 'viewer' } = req.body;

    try {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, email, password_hash, role]
      );

      const user = result.rows[0];
      const token = signToken(user);

      res.status(201).json({ token, user: safeUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (!user.is_active) {
        return res.status(403).json({ error: 'Account is deactivated' });
      }

      const token = signToken(user);
      res.json({ token, user: safeUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// JWT is stateless — client simply discards the token.
// A token blocklist (Redis) can be added on Day 6 when Redis is wired up.

router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
