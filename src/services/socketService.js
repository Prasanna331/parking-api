const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    // Join a room for a specific parking lot
    socket.on('join:lot', (lotId) => {
      socket.join(`lot:${lotId}`);
      logger.info(`Client ${socket.id} joined lot:${lotId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Broadcast spot status update to all clients watching a lot
const emitSpotUpdate = (lotId, spotData) => {
  if (io) {
    io.to(`lot:${lotId}`).emit('spot:updated', spotData);
  }
};

module.exports = { initSocket, emitSpotUpdate };
