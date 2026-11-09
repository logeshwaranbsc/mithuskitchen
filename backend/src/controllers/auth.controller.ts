import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { inMemoryStore } from '../repositories/in-memory-store';

export class AuthController {
  async sendOtp(req: Request, res: Response) {
    try {
      const { phone_number } = req.body;
      const result = await authService.sendOtp(phone_number);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async verifyToken(req: Request, res: Response) {
    try {
      const { phone_number, otp, full_name } = req.body;
      const result = await authService.verifyOtp(phone_number, otp, full_name);
      return sendSuccess(res, result, 'Logged in successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async adminLogin(req: Request, res: Response) {
    try {
      const { phone_number, password } = req.body;
      const result = await authService.adminLogin(phone_number, password);
      return sendSuccess(res, result, 'Admin authenticated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 401);
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }
      const profile = inMemoryStore.profiles.find((p) => p.id === req.user?.id);
      return sendSuccess(res, profile || req.user, 'Current user profile');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}

export const authController = new AuthController();
