import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/dashboard', (req, res) => reportController.getDashboard(req, res));
router.get('/daily', (req, res) => reportController.getDaily(req, res));
router.get('/food-wise', (req, res) => reportController.getFoodWise(req, res));
router.get('/export-csv', (req, res) => reportController.exportCsv(req, res));

export default router;
