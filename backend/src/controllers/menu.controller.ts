import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { inMemoryStore, MealCategory, MealSlot } from '../repositories/in-memory-store';
import { sendSuccess, sendError } from '../utils/response';

export class MenuController {
  async getCategories(req: Request, res: Response) {
    try {
      const categories = inMemoryStore.meal_categories.sort((a, b) => a.display_order - b.display_order);
      return sendSuccess(res, categories);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const cat = inMemoryStore.meal_categories.find((c) => c.id === req.params.id);
      if (!cat) {
        return sendError(res, 'Meal category not found', 404);
      }
      Object.assign(cat, req.body, { updated_at: new Date().toISOString() });
      return sendSuccess(res, cat, 'Meal category updated');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getMealSlots(req: Request, res: Response) {
    try {
      const { category_id } = req.query;
      let slots = inMemoryStore.meal_slots;
      if (category_id) {
        slots = slots.filter((s) => s.category_id === category_id);
      }
      return sendSuccess(res, slots);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async createMealSlot(req: Request, res: Response) {
    try {
      const newSlot: MealSlot = {
        id: uuidv4(),
        ...req.body,
        created_at: new Date().toISOString(),
      };
      inMemoryStore.meal_slots.push(newSlot);
      return sendSuccess(res, newSlot, 'Meal slot created', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async updateMealSlot(req: Request, res: Response) {
    try {
      const slot = inMemoryStore.meal_slots.find((s) => s.id === req.params.id);
      if (!slot) {
        return sendError(res, 'Meal slot not found', 404);
      }
      Object.assign(slot, req.body);
      return sendSuccess(res, slot, 'Meal slot updated');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async deleteMealSlot(req: Request, res: Response) {
    try {
      const index = inMemoryStore.meal_slots.findIndex((s) => s.id === req.params.id);
      if (index === -1) {
        return sendError(res, 'Meal slot not found', 404);
      }
      inMemoryStore.meal_slots.splice(index, 1);
      return sendSuccess(res, { id: req.params.id }, 'Meal slot removed');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const menuController = new MenuController();
