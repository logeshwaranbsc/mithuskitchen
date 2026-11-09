import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { updateCategoryTimingSchema, createMealSlotSchema, updateMealSlotSchema } from '../validators/menu.validator';

const router = Router();

// Categories
router.get('/categories', (req, res) => menuController.getCategories(req, res));
router.put('/admin/categories/:id', authenticateToken, requireAdmin, validateRequest(updateCategoryTimingSchema), (req, res) => menuController.updateCategory(req, res));

// Meal slots
router.get('/slots', (req, res) => menuController.getMealSlots(req, res));
router.post('/admin/slots', authenticateToken, requireAdmin, validateRequest(createMealSlotSchema), (req, res) => menuController.createMealSlot(req, res));
router.put('/admin/slots/:id', authenticateToken, requireAdmin, validateRequest(updateMealSlotSchema), (req, res) => menuController.updateMealSlot(req, res));
router.delete('/admin/slots/:id', authenticateToken, requireAdmin, (req, res) => menuController.deleteMealSlot(req, res));

export default router;
