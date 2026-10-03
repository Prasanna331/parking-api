require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');
const logger = require('../utils/logger');

const runMigration = async () => {
  const schemaPath = path.join(__dirname, '../../schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    logger.info('Running database migration...');
    await pool.query(sql);
    logger.info('✅ Migration complete — all tables created.');
  } catch (err) {
    logger.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigration();
