import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createSubscriptionSchema, updateSubscriptionStatusSchema } from '../validators/subscription.validator';

const router = Router();

// Public plans
router.get('/plans', (req, res) => subscriptionController.getPlans(req, res));

// Customer
router.post('/customer', authenticateToken, validateRequest(createSubscriptionSchema), (req, res) => subscriptionController.createSubscription(req, res));
router.get('/customer', authenticateToken, (req, res) => subscriptionController.getCustomerSubscriptions(req, res));

// Admin
router.get('/admin', authenticateToken, requireAdmin, (req, res) => subscriptionController.getAdminSubscriptions(req, res));
router.patch('/admin/:id/status', authenticateToken, requireAdmin, validateRequest(updateSubscriptionStatusSchema), (req, res) => subscriptionController.updateSubscriptionStatus(req, res));

export default router;
