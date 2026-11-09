import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { inMemoryStore, DeliveryArea } from '../repositories/in-memory-store';
import { sendSuccess, sendError } from '../utils/response';

export class SettingsController {
  async getSettings(req: Request, res: Response) {
    try {
      return sendSuccess(res, inMemoryStore.kitchen_settings);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      const { key, value } = req.body;
      if (!key) return sendError(res, 'Setting key is required', 400);

      inMemoryStore.kitchen_settings[key] = value;
      return sendSuccess(res, inMemoryStore.kitchen_settings, 'Settings updated');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getDeliveryAreas(req: Request, res: Response) {
    try {
      return sendSuccess(res, inMemoryStore.delivery_areas);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async createDeliveryArea(req: Request, res: Response) {
    try {
      const newArea: DeliveryArea = {
        id: uuidv4(),
        ...req.body,
        created_at: new Date().toISOString(),
      };
      inMemoryStore.delivery_areas.push(newArea);
      return sendSuccess(res, newArea, 'Delivery area added', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async updateDeliveryArea(req: Request, res: Response) {
    try {
      const area = inMemoryStore.delivery_areas.find((a) => a.id === req.params.id);
      if (!area) return sendError(res, 'Delivery area not found', 404);

      Object.assign(area, req.body);
      return sendSuccess(res, area, 'Delivery area updated');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async deleteDeliveryArea(req: Request, res: Response) {
    try {
      const index = inMemoryStore.delivery_areas.findIndex((a) => a.id === req.params.id);
      if (index === -1) return sendError(res, 'Delivery area not found', 404);

      inMemoryStore.delivery_areas.splice(index, 1);
      return sendSuccess(res, { id: req.params.id }, 'Delivery area deleted');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getAdminCustomers(req: Request, res: Response) {
    try {
      const customers = inMemoryStore.profiles
        .filter((p) => p.role === 'customer')
        .map((p) => {
          const orders = inMemoryStore.orders.filter((o) => o.customer_id === p.id);
          const subs = inMemoryStore.subscriptions.filter((s) => s.customer_id === p.id);
          const addresses = inMemoryStore.customer_addresses.filter((a) => a.profile_id === p.id);
          const totalSpent = orders
            .filter((o) => o.order_status !== 'cancelled')
            .reduce((acc, o) => acc + o.total_amount, 0);

          return {
            ...p,
            total_orders: orders.length,
            total_subscriptions: subs.length,
            total_spent: totalSpent,
            addresses,
          };
        });

      return sendSuccess(res, customers);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}

export const settingsController = new SettingsController();
