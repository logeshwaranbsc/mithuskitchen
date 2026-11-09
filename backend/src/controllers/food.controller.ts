import { Request, Response } from 'express';
import { foodService } from '../services/food.service';
import { storageService } from '../services/storage.service';
import { sendSuccess, sendError } from '../utils/response';

export class FoodController {
  async getFoods(req: Request, res: Response) {
    try {
      const { category_id, is_veg, is_active, is_available, search } = req.query;
      const foods = await foodService.getFoods({
        category_id: category_id as string,
        is_veg: is_veg !== undefined ? is_veg === 'true' : undefined,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        is_available: is_available !== undefined ? is_available === 'true' : undefined,
        search: search as string,
      });
      return sendSuccess(res, foods);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async getFoodById(req: Request, res: Response) {
    try {
      const food = await foodService.getFoodById(req.params.id);
      if (!food) {
        return sendError(res, 'Food item not found', 404);
      }
      return sendSuccess(res, food);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async createFood(req: Request, res: Response) {
    try {
      const newFood = await foodService.createFood(req.body);
      return sendSuccess(res, newFood, 'Food item created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async updateFood(req: Request, res: Response) {
    try {
      const updated = await foodService.updateFood(req.params.id, req.body, req.user?.id);
      return sendSuccess(res, updated, 'Food item updated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async deleteFood(req: Request, res: Response) {
    try {
      await foodService.deleteFood(req.params.id);
      return sendSuccess(res, { id: req.params.id }, 'Food item deleted successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getPriceHistory(req: Request, res: Response) {
    try {
      const history = await foodService.getPriceHistory(req.params.id);
      return sendSuccess(res, history);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, 'No image file uploaded. Please provide an image file under the "image" field.', 400);
      }
      const result = await storageService.uploadFoodImage(req.file);
      return sendSuccess(res, result, 'Image uploaded successfully to Supabase Storage', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Image upload failed', 500);
    }
  }

  async getStorageImages(req: Request, res: Response) {
    try {
      const images = await storageService.listFoodImages();
      return sendSuccess(res, images);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}

export const foodController = new FoodController();
