const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
  logger.info('📦 Connected to PostgreSQL');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL pool error:', err);
});

module.exports = pool;
