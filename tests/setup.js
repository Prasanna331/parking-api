// Jest setup — provides env vars required by the app during tests.
// Reads .env if present; falls back to the docker-compose defaults.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Defaults matching docker-compose.yml
process.env.NODE_ENV     = process.env.NODE_ENV     || 'test';
process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'test-secret-key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
process.env.DB_HOST      = process.env.DB_HOST      || 'localhost';
process.env.DB_PORT      = process.env.DB_PORT      || '5432';
process.env.DB_NAME      = process.env.DB_NAME      || 'parking_db';
process.env.DB_USER      = process.env.DB_USER      || 'parking_user';
process.env.DB_PASSWORD  = process.env.DB_PASSWORD  || 'PP$1234';
