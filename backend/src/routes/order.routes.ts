import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

// Customer
router.post('/customer', authenticateToken, validateRequest(createOrderSchema), (req, res) => orderController.createOrder(req, res));
router.get('/customer', authenticateToken, (req, res) => orderController.getCustomerOrders(req, res));
router.get('/detail/:id', authenticateToken, (req, res) => orderController.getOrderById(req, res));

// Admin
router.get('/admin', authenticateToken, requireAdmin, (req, res) => orderController.getAdminOrders(req, res));
router.patch('/admin/:id/status', authenticateToken, requireAdmin, validateRequest(updateOrderStatusSchema), (req, res) => orderController.updateOrderStatus(req, res));

export default router;
