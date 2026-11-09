import { z } from 'zod';

export const updateCategoryTimingSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    default_delivery_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be HH:mm or HH:mm:ss').optional(),
    cutoff_hours: z.number().int().min(0).max(24).optional(),
    is_enabled: z.boolean().optional(),
  }),
});

export const createMealSlotSchema = z.object({
  body: z.object({
    category_id: z.string().min(1),
    slot_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
    display_label: z.string().min(3),
    max_orders: z.number().int().min(1),
    is_active: z.boolean().default(true),
  }),
});

export const updateMealSlotSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    slot_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
    display_label: z.string().optional(),
    max_orders: z.number().int().min(1).optional(),
    is_active: z.boolean().optional(),
  }),
});
