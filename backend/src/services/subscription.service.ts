import { v4 as uuidv4 } from 'uuid';
import { inMemoryStore, Subscription, SubscriptionMeal, SubscriptionPlan } from '../repositories/in-memory-store';
import { notificationService } from './notification.service';
import { logger } from '../utils/logger';

export interface CreateSubscriptionDTO {
  customerId: string;
  planId: string;
  startDate: string; // YYYY-MM-DD
  addressId?: string;
  deliveryAddress?: {
    customer_name: string;
    phone_number: string;
    address_line1: string;
    address_line2?: string;
    landmark?: string;
    city: string;
    pincode: string;
  };
  paymentMethod: 'cash_on_delivery' | 'cash_on_service';
  specialNotes?: string;
}

export class SubscriptionService {
  /**
   * Get all active subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    return inMemoryStore.subscription_plans.filter((p) => p.is_active);
  }

  /**
   * Create a 7-day subscription and automatically schedule meals
   */
  async createSubscription(dto: CreateSubscriptionDTO): Promise<Subscription> {
    const plan = inMemoryStore.subscription_plans.find((p) => p.id === dto.planId);
    if (!plan || !plan.is_active) {
      throw new Error('Selected subscription plan is invalid or inactive');
    }

    const now = new Date().toISOString();
    const start = new Date(dto.startDate);
    // End date is start date + (duration_days - 1)
    const end = new Date(start);
    end.setDate(start.getDate() + (plan.duration_days - 1));
    const endDateStr = end.toISOString().split('T')[0];

    // Address Snapshot
    let addressSnapshot: any = null;
    if (dto.addressId) {
      const savedAddress = inMemoryStore.customer_addresses.find((a) => a.id === dto.addressId);
      if (savedAddress) {
        const customer = inMemoryStore.profiles.find((p) => p.id === dto.customerId);
        addressSnapshot = {
          customer_name: customer?.full_name || 'Customer',
          phone_number: customer?.phone_number || '',
          address_line1: savedAddress.address_line1,
          address_line2: savedAddress.address_line2,
          landmark: savedAddress.landmark,
          city: savedAddress.city,
          state: savedAddress.state,
          pincode: savedAddress.pincode,
        };
      }
    }

    if (!addressSnapshot && dto.deliveryAddress) {
      addressSnapshot = { ...dto.deliveryAddress };
    }

    if (!addressSnapshot || !addressSnapshot.address_line1) {
      throw new Error('Valid delivery address is required for subscription');
    }

    // Generate Subscription Number: SUB-YYYYMMDD-XXXX
    const dateTag = dto.startDate.replace(/-/g, '');
    const subNumber = `SUB-${dateTag}-${Math.floor(1000 + Math.random() * 9000)}`;
    const subId = uuidv4();

    const subscription: Subscription = {
      id: subId,
      subscription_number: subNumber,
      customer_id: dto.customerId,
      plan_id: plan.id,
      address_id: dto.addressId || 'custom',
      address_snapshot: addressSnapshot,
      start_date: dto.startDate,
      end_date: endDateStr,
      total_amount: plan.price,
      payment_method: dto.paymentMethod,
      payment_status: 'pending',
      status: 'active',
      pause_dates: [],
      special_notes: dto.specialNotes,
      created_at: now,
      updated_at: now,
    };

    inMemoryStore.subscriptions.unshift(subscription);

    // Automatically schedule meals for each day and each included category
    const scheduledMeals: SubscriptionMeal[] = [];
    for (let dayOffset = 0; dayOffset < plan.duration_days; dayOffset++) {
      const mealDate = new Date(start);
      mealDate.setDate(start.getDate() + dayOffset);
      const mealDateStr = mealDate.toISOString().split('T')[0];

      for (const catCode of plan.meal_categories_included) {
        const category = inMemoryStore.meal_categories.find((c) => c.code === catCode);
        if (category) {
          const mealEntry: SubscriptionMeal = {
            id: uuidv4(),
            subscription_id: subId,
            meal_date: mealDateStr,
            category_id: category.id,
            status: 'scheduled',
            notes: `7-Day plan meal for ${category.name}`,
            created_at: now,
          };
          scheduledMeals.push(mealEntry);
          inMemoryStore.subscription_meals.push(mealEntry);
        }
      }
    }

    logger.info(`Activated subscription ${subNumber} (${plan.name}) for customer ${dto.customerId}. Scheduled ${scheduledMeals.length} meals.`);

    // Queue WhatsApp notification
    notificationService.notifySubscriptionActivated(subscription, plan.name);

    return subscription;
  }

  /**
   * Get subscriptions for a customer
   */
  async getCustomerSubscriptions(customerId: string): Promise<any[]> {
    const subs = inMemoryStore.subscriptions.filter((s) => s.customer_id === customerId);
    return subs.map((sub) => {
      const plan = inMemoryStore.subscription_plans.find((p) => p.id === sub.plan_id);
      const meals = inMemoryStore.subscription_meals.filter((m) => m.subscription_id === sub.id);
      
      // Calculate remaining days
      const today = new Date().toISOString().split('T')[0];
      const futureMeals = meals.filter((m) => m.meal_date >= today && m.status !== 'cancelled' && m.status !== 'skipped');
      const uniqueRemainingDays = new Set(futureMeals.map((m) => m.meal_date)).size;

      return {
        ...sub,
        plan_name: plan?.name,
        plan_code: plan?.code,
        remaining_days: uniqueRemainingDays,
        scheduled_meals: meals,
      };
    });
  }

  /**
   * Get all subscriptions for Admin
   */
  async getAllSubscriptions(): Promise<any[]> {
    return inMemoryStore.subscriptions.map((sub) => {
      const customer = inMemoryStore.profiles.find((p) => p.id === sub.customer_id);
      const plan = inMemoryStore.subscription_plans.find((p) => p.id === sub.plan_id);
      const meals = inMemoryStore.subscription_meals.filter((m) => m.subscription_id === sub.id);
      const today = new Date().toISOString().split('T')[0];
      const remainingDays = new Set(
        meals.filter((m) => m.meal_date >= today && m.status !== 'cancelled').map((m) => m.meal_date)
      ).size;

      return {
        ...sub,
        customer_name: customer?.full_name || sub.address_snapshot?.customer_name,
        customer_phone: customer?.phone_number || sub.address_snapshot?.phone_number,
        plan_name: plan?.name,
        remaining_days: remainingDays,
        scheduled_meals: meals,
      };
    });
  }

  /**
   * Update subscription status (activate, pause, resume, cancel)
   */
  async updateStatus(
    id: string,
    status: 'pending' | 'active' | 'paused' | 'cancelled' | 'completed',
    pauseDates?: string[],
    note?: string
  ): Promise<Subscription> {
    const sub = inMemoryStore.subscriptions.find((s) => s.id === id);
    if (!sub) {
      throw new Error('Subscription not found');
    }

    sub.status = status;
    if (pauseDates) {
      sub.pause_dates = pauseDates;
    }
    sub.updated_at = new Date().toISOString();

    if (status === 'paused' && pauseDates && pauseDates.length > 0) {
      // Mark meals on paused dates as skipped
      inMemoryStore.subscription_meals
        .filter((m) => m.subscription_id === sub.id && pauseDates.includes(m.meal_date))
        .forEach((m) => {
          m.status = 'skipped';
        });
    } else if (status === 'cancelled') {
      // Mark upcoming scheduled meals as cancelled
      const today = new Date().toISOString().split('T')[0];
      inMemoryStore.subscription_meals
        .filter((m) => m.subscription_id === sub.id && m.meal_date >= today && m.status === 'scheduled')
        .forEach((m) => {
          m.status = 'cancelled';
        });
    }

    logger.info(`Subscription ${sub.subscription_number} status updated to ${status}.`);
    return sub;
  }
}

export const subscriptionService = new SubscriptionService();
