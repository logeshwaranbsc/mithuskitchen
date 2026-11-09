import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { sendError } from '../utils/response';
import { inMemoryStore } from '../repositories/in-memory-store';
import { getSupabaseAdminClient } from '../integrations/supabase/client';

export interface AuthenticatedUser {
  id: string;
  phone_number: string;
  role: 'customer' | 'admin' | 'kitchen_staff';
  full_name: string;
  email?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication token required', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      sendError(res, 'Invalid authorization format', 401);
      return;
    }

    // First try verify JWT
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
      req.user = decoded;
      next();
      return;
    } catch (jwtErr) {
      // If JWT fails and Supabase is configured, check Supabase auth
      const supabaseAdmin = getSupabaseAdminClient();
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (data?.user && !error) {
          const profile = inMemoryStore.profiles.find((p) => p.phone_number === data.user.phone);
          req.user = {
            id: profile?.id || data.user.id,
            phone_number: data.user.phone || '',
            role: profile?.role || 'customer',
            full_name: profile?.full_name || 'Customer',
            email: data.user.email,
          };
          next();
          return;
        }
      }

      sendError(res, 'Invalid or expired session token', 401);
      return;
    }
  } catch (error) {
    sendError(res, 'Authentication error', 500, error);
    return;
  }
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    req.user = decoded;
  } catch {
    // Ignore invalid optional token
  }
  next();
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    sendError(res, 'Authentication required', 401);
    return;
  }
  if (req.user.role !== 'admin' && req.user.role !== 'kitchen_staff') {
    sendError(res, 'Access forbidden: Admin privilege required', 403);
    return;
  }
  next();
};
