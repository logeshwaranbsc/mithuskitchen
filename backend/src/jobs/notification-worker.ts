import { notificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

let isRunning = false;
let workerInterval: NodeJS.Timeout | null = null;

export const startNotificationWorker = (intervalMs = 15000) => {
  if (workerInterval) return;

  logger.info(`Starting Notification Outbox Worker (polling every ${intervalMs / 1000}s)`);

  workerInterval = setInterval(async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      const processed = await notificationService.processPendingOutbox();
      if (processed > 0) {
        logger.info(`Notification Outbox Worker processed ${processed} notifications.`);
      }
    } catch (err) {
      logger.error('Error in Notification Outbox Worker:', err);
    } finally {
      isRunning = false;
    }
  }, intervalMs);
};

export const stopNotificationWorker = () => {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    logger.info('Notification Outbox Worker stopped.');
  }
};
