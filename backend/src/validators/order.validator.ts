import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    category_id: z.string().min(1, 'Meal category is required'),
    delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Delivery date must be YYYY-MM-DD'),
    delivery_slot: z.string().min(1, 'Delivery slot is required'),
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
    items: z
      .array(
        z.object({
          food_item_id: z.string().min(1),
          quantity: z.number().int().positive('Quantity must be greater than 0'),
        })
      )
      .min(1, 'At least one food item must be selected'),
    payment_method: z.enum(['cash_on_delivery', 'cash_on_service']).default('cash_on_delivery'),
    special_instructions: z.string().optional(),
    whatsapp_opt_in: z.boolean().default(true),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
    payment_status: z.enum(['pending', 'collected', 'failed', 'refunded']).optional(),
    note: z.string().optional(),
  }),
});
