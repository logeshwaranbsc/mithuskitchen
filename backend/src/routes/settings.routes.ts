import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', (req, res) => settingsController.getSettings(req, res));
router.get('/delivery-areas', (req, res) => settingsController.getDeliveryAreas(req, res));

// Admin only
router.put('/admin', authenticateToken, requireAdmin, (req, res) => settingsController.updateSettings(req, res));
router.post('/admin/delivery-areas', authenticateToken, requireAdmin, (req, res) => settingsController.createDeliveryArea(req, res));
router.put('/admin/delivery-areas/:id', authenticateToken, requireAdmin, (req, res) => settingsController.updateDeliveryArea(req, res));
router.delete('/admin/delivery-areas/:id', authenticateToken, requireAdmin, (req, res) => settingsController.deleteDeliveryArea(req, res));
router.get('/admin/customers', authenticateToken, requireAdmin, (req, res) => settingsController.getAdminCustomers(req, res));

export default router;
