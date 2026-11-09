import { z } from 'zod';

export const createFoodItemSchema = z.object({
  body: z.object({
    category_id: z.string().min(1, 'Category is required'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().default(''),
    image_url: z.string().url('Valid image URL is required'),
    base_price: z.number().int().min(0, 'Base price must be a non-negative integer in paise'),
    is_veg: z.boolean().default(true),
    is_available: z.boolean().default(true),
    is_active: z.boolean().default(true),
    calories: z.number().optional(),
    serving_size: z.string().optional(),
  }),
});

export const updateFoodItemSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    category_id: z.string().optional(),
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    image_url: z.string().url().optional(),
    base_price: z.number().int().min(0).optional(),
    is_veg: z.boolean().optional(),
    is_available: z.boolean().optional(),
    is_active: z.boolean().optional(),
    calories: z.number().optional(),
    serving_size: z.string().optional(),
  }),
});
