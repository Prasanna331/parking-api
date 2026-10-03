require('dotenv').config();
const app = require('./app');
const { createServer } = require('http');
const { initSocket } = require('./services/socketService');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  logger.info(`🚀 Parking API running on port ${PORT}`);
  logger.info(`📡 WebSocket server ready`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
});
