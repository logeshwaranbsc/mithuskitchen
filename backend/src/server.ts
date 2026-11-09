import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { startNotificationWorker, stopNotificationWorker } from './jobs/notification-worker';

const server = app.listen(config.port, () => {
  logger.info(`=======================================================`);
  logger.info(`  HOME KITCHEN - Backend Server Running`);
  logger.info(`  Environment : ${config.nodeEnv}`);
  logger.info(`  Port        : ${config.port}`);
  logger.info(`  Base API    : http://localhost:${config.port}/api/v1`);
  logger.info(`  Health Check: http://localhost:${config.port}/api/v1/health`);
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
