import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'home-kitchen-super-secret-key-2026',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'mithu',
  supabaseS3Endpoint: process.env.SUPABASE_S3_ENDPOINT || 'https://txzgtgvfdhcazqlelolt.storage.supabase.co/storage/v1/s3',

  // WhatsApp Cloud API
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    adminNumber: process.env.WHATSAPP_ADMIN_NUMBER || '+919876543210',
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'home_kitchen_verify_token_secure',
    appSecret: process.env.WHATSAPP_APP_SECRET || '',
  },

  // OTP
  otpProvider: process.env.OTP_PROVIDER || 'mock',
  otpApiKey: process.env.OTP_API_KEY || '',

  logLevel: process.env.LOG_LEVEL || 'info',
  timezone: 'Asia/Kolkata',
  defaultCutoffHours: 5,
};
