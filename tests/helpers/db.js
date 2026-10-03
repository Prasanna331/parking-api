/**
 * Test database helpers — use the real pool but clean up after each suite.
 * Requires a running PostgreSQL with the schema already applied.
 */
const pool = require('../../src/config/db');

async function clearTables() {
  // Order matters: spots → lots → users (FK constraints)
  await pool.query('DELETE FROM parking_spots');
  await pool.query('DELETE FROM parking_lots');
  await pool.query('DELETE FROM users');
}

async function closePool() {
  await pool.end();
}

module.exports = { clearTables, closePool };

