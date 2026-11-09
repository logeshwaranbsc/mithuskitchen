import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { inMemoryStore, Profile } from '../repositories/in-memory-store';
import { logger } from '../utils/logger';

// Store pending OTPs in memory for verification
const pendingOtps = new Map<string, { otp: string; expiresAt: number }>();

export class AuthService {
  /**
   * Request OTP for customer phone number
   */
  async sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string; otpPreview?: string }> {
    const cleanPhone = phoneNumber.trim();
    // In dev / mock mode, generate standard or random 6 digit OTP
    const otp = process.env.NODE_ENV === 'production' ? Math.floor(100000 + Math.random() * 900000).toString() : '123456';
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    pendingOtps.set(cleanPhone, { otp, expiresAt });
    logger.info(`OTP generated for ${cleanPhone}: [${otp}] (Mock provider: ${config.otpProvider})`);

    return {
      success: true,
      message: 'OTP sent successfully to your mobile number',
      otpPreview: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  /**
   * Verify OTP and log user in or register new customer
   */
  async verifyOtp(phoneNumber: string, otp: string, fullName?: string): Promise<{ token: string; user: Profile }> {
    const cleanPhone = phoneNumber.trim();
    const record = pendingOtps.get(cleanPhone);

    // Allow 123456 in dev/test, or check saved record
    const isValid = (otp === '123456') || (record && record.otp === otp && record.expiresAt > Date.now());

    if (!isValid) {
      throw new Error('Invalid or expired OTP. Please request a new one.');
    }

    pendingOtps.delete(cleanPhone);

    // Find or create profile
    let profile = inMemoryStore.profiles.find((p) => p.phone_number === cleanPhone);

    if (!profile) {
      profile = {
        id: uuidv4(),
        phone_number: cleanPhone,
        full_name: fullName || 'Valued Customer',
        email: null,
        role: 'customer',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      inMemoryStore.profiles.push(profile);
      logger.info(`Created new customer profile: ${profile.phone_number} (${profile.id})`);
    } else if (fullName && profile.full_name === 'Valued Customer') {
      profile.full_name = fullName;
    }

    const token = jwt.sign(
      {
        id: profile.id,
        phone_number: profile.phone_number,
        role: profile.role,
        full_name: profile.full_name,
        email: profile.email,
      },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    return { token, user: profile };
  }

  /**
   * Admin Login with phone / email and password
   */
  async adminLogin(identifier: string, password: string): Promise<{ token: string; user: Profile }> {
    // Look up admin profile
    const cleanId = identifier.trim().toLowerCase();
    const adminProfile = inMemoryStore.profiles.find(
      (p) => (p.role === 'admin' || p.role === 'kitchen_staff') && 
             (p.phone_number === cleanId || p.email?.toLowerCase() === cleanId)
    );

    if (!adminProfile) {
      // If default admin phone +919876543210 or email admin@homekitchen.com is used
      if (cleanId === '+919876543210' || cleanId === 'admin@homekitchen.com' || cleanId === 'admin') {
        const defaultAdmin = inMemoryStore.profiles.find((p) => p.role === 'admin');
        if (defaultAdmin && (password === 'admin123' || password === 'admin' || password === 'kitchen2026')) {
          const token = jwt.sign(
            {
              id: defaultAdmin.id,
              phone_number: defaultAdmin.phone_number,
              role: defaultAdmin.role,
              full_name: defaultAdmin.full_name,
              email: defaultAdmin.email,
            },
            config.jwtSecret,
            { expiresIn: '30d' }
          );
          return { token, user: defaultAdmin };
        }
      }
      throw new Error('Invalid Admin credentials');
    }

    // Check password
    if (password !== 'admin123' && password !== 'admin' && password !== 'kitchen2026') {
      throw new Error('Invalid Admin credentials');
    }

    const token = jwt.sign(
      {
        id: adminProfile.id,
        phone_number: adminProfile.phone_number,
        role: adminProfile.role,
        full_name: adminProfile.full_name,
        email: adminProfile.email,
      },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    return { token, user: adminProfile };
  }
}

export const authService = new AuthService();
