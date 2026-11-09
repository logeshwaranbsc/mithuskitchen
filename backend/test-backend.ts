import app from './src/app';
import { inMemoryStore } from './src/repositories/in-memory-store';

console.log('Testing HOME KITCHEN Backend...');
console.log('Categories loaded:', inMemoryStore.meal_categories.length);
console.log('Foods loaded:', inMemoryStore.food_items.length);
console.log('Subscription plans loaded:', inMemoryStore.subscription_plans.length);
console.log('App initialized successfully!');
process.exit(0);
