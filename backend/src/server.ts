import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { startNotificationWorker, stopNotificationWorker } from './jobs/notification-worker';

const port = config.port;

const server = app.listen(port, '0.0.0.0', () => {
  logger.info(`=======================================================`);
  logger.info(`  HOME KITCHEN - Backend Server Running`);
  logger.info(`  Environment : ${config.nodeEnv}`);
  logger.info(`  Port        : ${port}`);
  logger.info(`  Base API    : http://0.0.0.0:${port}`);
  logger.info(`  Health Check: http://0.0.0.0:${port}/health`);
  logger.info(`=======================================================`);

  // Start background outbox notification worker
  startNotificationWorker(15000);
});

// Graceful Shutdown
const handleShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  stopNotificationWorker();
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
