import { v4 as uuidv4 } from 'uuid';
import { inMemoryStore, FoodItem, FoodPriceHistory } from '../repositories/in-memory-store';
import { logger } from '../utils/logger';

export class FoodService {
  /**
   * Get all foods with optional filtering
   */
  async getFoods(options?: {
    category_id?: string;
    is_veg?: boolean;
    is_active?: boolean;
    is_available?: boolean;
    search?: string;
  }): Promise<FoodItem[]> {
    let foods = [...inMemoryStore.food_items];

    if (options?.category_id) {
      foods = foods.filter((f) => f.category_id === options.category_id);
    }
    if (typeof options?.is_veg === 'boolean') {
      foods = foods.filter((f) => f.is_veg === options.is_veg);
    }
    if (typeof options?.is_active === 'boolean') {
      foods = foods.filter((f) => f.is_active === options.is_active);
    }
    if (typeof options?.is_available === 'boolean') {
      foods = foods.filter((f) => f.is_available === options.is_available);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      foods = foods.filter((f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    }

    return foods;
  }

  async getFoodById(id: string): Promise<FoodItem | null> {
    return inMemoryStore.food_items.find((f) => f.id === id) || null;
  }

  /**
   * Add new food item
   */
  async createFood(data: Omit<FoodItem, 'id' | 'created_at' | 'updated_at'>): Promise<FoodItem> {
    const now = new Date().toISOString();
    const newFood: FoodItem = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
    };

    inMemoryStore.food_items.push(newFood);
    logger.info(`Created food item: ${newFood.name} (${newFood.id}) for ₹${newFood.base_price / 100}`);
    return newFood;
  }

  /**
   * Update food item and log price history if price changed
   */
  async updateFood(id: string, updates: Partial<FoodItem>, changedBy?: string): Promise<FoodItem> {
    const foodIndex = inMemoryStore.food_items.findIndex((f) => f.id === id);
    if (foodIndex === -1) {
      throw new Error('Food item not found');
    }

    const currentFood = inMemoryStore.food_items[foodIndex];
    const now = new Date().toISOString();

    // Check if price changed -> log to food_price_history
    if (typeof updates.base_price === 'number' && updates.base_price !== currentFood.base_price) {
      const historyEntry: FoodPriceHistory = {
        id: uuidv4(),
        food_item_id: currentFood.id,
        old_price: currentFood.base_price,
        new_price: updates.base_price,
        changed_by: changedBy,
        changed_at: now,
        reason: 'Admin price update',
      };
      inMemoryStore.food_price_history.push(historyEntry);
      logger.info(`Food price changed for ${currentFood.name}: ₹${currentFood.base_price / 100} -> ₹${updates.base_price / 100}`);
    }

    const updatedFood: FoodItem = {
      ...currentFood,
      ...updates,
      updated_at: now,
    };

    inMemoryStore.food_items[foodIndex] = updatedFood;
    return updatedFood;
  }

  /**
   * Delete food item
   */
  async deleteFood(id: string): Promise<boolean> {
    const index = inMemoryStore.food_items.findIndex((f) => f.id === id);
    if (index === -1) {
      throw new Error('Food item not found');
    }
    inMemoryStore.food_items.splice(index, 1);
    logger.info(`Deleted food item ${id}`);
    return true;
  }

  /**
   * Price history for a food item
   */
  async getPriceHistory(foodId: string): Promise<FoodPriceHistory[]> {
    return inMemoryStore.food_price_history.filter((h) => h.food_item_id === foodId);
  }
}

export const foodService = new FoodService();
