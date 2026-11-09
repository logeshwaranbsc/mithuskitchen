import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { sendOtpSchema, verifyOtpSchema, adminLoginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/send-otp', validateRequest(sendOtpSchema), (req, res) => authController.sendOtp(req, res));
router.post('/verify-token', validateRequest(verifyOtpSchema), (req, res) => authController.verifyToken(req, res));
router.post('/admin-login', validateRequest(adminLoginSchema), (req, res) => authController.adminLogin(req, res));
router.get('/me', authenticateToken, (req, res) => authController.getMe(req, res));

export default router;
