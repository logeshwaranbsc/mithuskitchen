import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Official WhatsApp Cloud API Webhook verification & events
router.get('/whatsapp', (req, res) => webhookController.verifyWebhook(req, res));
router.post('/whatsapp', (req, res) => webhookController.handleWebhook(req, res));

// Admin outbox inspection
router.get('/notifications', authenticateToken, requireAdmin, (req, res) => webhookController.getNotifications(req, res));

export default router;
