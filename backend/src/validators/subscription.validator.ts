import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  body: z.object({
    plan_id: z.string().min(1, 'Subscription plan ID is required'),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
    address_id: z.string().optional(),
    delivery_address: z
      .object({
        customer_name: z.string().min(2),
        phone_number: z.string().min(10),
        address_line1: z.string().min(3),
        address_line2: z.string().optional(),
        landmark: z.string().optional(),
        city: z.string().default('Bangalore'),
        pincode: z.string().min(6),
      })
      .optional(),
    payment_method: z.enum(['cash_on_delivery', 'cash_on_service']).default('cash_on_service'),
    special_notes: z.string().optional(),
  }),
});

export const updateSubscriptionStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['pending', 'active', 'paused', 'cancelled', 'completed']),
    pause_dates: z.array(z.string()).optional(),
    note: z.string().optional(),
  }),
});
