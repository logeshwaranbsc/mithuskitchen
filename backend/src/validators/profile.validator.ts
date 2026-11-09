import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional().nullable(),
    avatar_url: z.string().url().optional().nullable(),
  }),
});

export const createAddressSchema = z.object({
  body: z.object({
    label: z.string().default('Home'),
    address_line1: z.string().min(3, 'Address line 1 is required'),
    address_line2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().default('Bangalore'),
    state: z.string().default('Karnataka'),
    pincode: z.string().min(6, 'Valid 6-digit pincode is required'),
    is_default: z.boolean().default(false),
  }),
});

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    label: z.string().optional(),
    address_line1: z.string().min(3).optional(),
    address_line2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().min(6).optional(),
    is_default: z.boolean().optional(),
  }),
});
