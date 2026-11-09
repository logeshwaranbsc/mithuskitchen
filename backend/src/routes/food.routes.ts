import { Router } from 'express';
import multer from 'multer';
import { foodController } from '../controllers/food.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createFoodItemSchema, updateFoodItemSchema } from '../validators/food.validator';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'));
    }
  },
});

const router = Router();

// Public
router.get('/', (req, res) => foodController.getFoods(req, res));
router.get('/:id', (req, res) => foodController.getFoodById(req, res));
router.get('/:id/history', authenticateToken, requireAdmin, (req, res) => foodController.getPriceHistory(req, res));

// Image upload to Supabase Storage (mithu bucket)
router.post('/upload-image', upload.single('image'), (req, res) => foodController.uploadImage(req, res));
router.get('/storage/images', (req, res) => foodController.getStorageImages(req, res));

// Admin only food management
router.post('/admin', authenticateToken, requireAdmin, validateRequest(createFoodItemSchema), (req, res) => foodController.createFood(req, res));
router.put('/admin/:id', authenticateToken, requireAdmin, validateRequest(updateFoodItemSchema), (req, res) => foodController.updateFood(req, res));
router.delete('/admin/:id', authenticateToken, requireAdmin, (req, res) => foodController.deleteFood(req, res));

export default router;
