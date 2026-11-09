import { z } from 'zod';

export const sendOtpSchema = z.object({
  body: z.object({
    phone_number: z.string().min(10, 'Valid phone number is required (at least 10 digits)'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone_number: z.string().min(10, 'Valid phone number is required'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    full_name: z.string().optional(),
  }),
});

export const adminLoginSchema = z.object({
  body: z.object({
    phone_number: z.string().min(10, 'Valid phone number or email is required'),
    password: z.string().min(4, 'Admin password is required'),
  }),
});
