import { Request, Response } from 'express';
import { config } from '../config/env';
import { inMemoryStore } from '../repositories/in-memory-store';
import { sendSuccess, sendError } from '../utils/response';
import { logger } from '../utils/logger';

export class WebhookController {
  /**
   * WhatsApp Webhook Verification (GET)
   */
  verifyWebhook(req: Request, res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.whatsapp.webhookVerifyToken) {
      logger.info('WhatsApp webhook verified successfully.');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  /**
   * WhatsApp Webhook Event Receiver (POST)
   */
  handleWebhook(req: Request, res: Response) {
    try {
      const body = req.body;
      logger.info('WhatsApp Webhook payload received:', JSON.stringify(body));

      if (body.object === 'whatsapp_business_account') {
        const entries = body.entry || [];
        for (const entry of entries) {
          const changes = entry.changes || [];
          for (const change of changes) {
            const value = change.value;
            const statuses = value?.statuses || [];
            for (const statusObj of statuses) {
              const msgId = statusObj.id;
              const deliveryStatus = statusObj.status; // delivered, read, failed

              // Update logs if found
              const logEntry = inMemoryStore.notification_logs.find((l) => l.whatsapp_message_id === msgId);
              if (logEntry) {
                logEntry.status = deliveryStatus;
              }
            }
          }
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    } catch (err: any) {
      logger.error('Error handling WhatsApp webhook:', err);
      return res.status(500).send('Error');
    }
  }

  /**
   * Get Outbox & Logs for Admin
   */
  getNotifications(req: Request, res: Response) {
    try {
      return sendSuccess(res, {
        outbox: inMemoryStore.notification_outbox.slice(-50).reverse(),
        logs: inMemoryStore.notification_logs.slice(-50).reverse(),
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}

export const webhookController = new WebhookController();
