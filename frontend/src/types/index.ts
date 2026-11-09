export interface User {
  id: string;
  phone_number: string;
  full_name: string;
  email: string | null;
  role: 'customer' | 'admin' | 'kitchen_staff';
}

export interface CustomerAddress {
  id: string;
  profile_id: string;
  label: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface MealCategory {
  id: string;
  code: 'breakfast' | 'lunch' | 'dinner';
  name: string;
  description: string;
  default_delivery_time: string;
  cutoff_hours: number;
  is_enabled: boolean;
  display_order: number;
}

export interface MealSlot {
  id: string;
  category_id: string;
  slot_time: string;
  display_label: string;
  max_orders: number;
  is_active: boolean;
}

export interface FoodItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  base_price: number; // in paise
  is_veg: boolean;
  is_available: boolean;
  is_active: boolean;
  calories?: number;
  serving_size?: string;
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_item_id: string;
  food_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  category_id: string;
  delivery_date: string;
  delivery_slot: string;
  address_snapshot: {
    customer_name: string;
    phone_number: string;
    address_line1: string;
    address_line2?: string;
    landmark?: string;
    city: string;
    pincode: string;
  };
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cash_on_delivery' | 'cash_on_service';
  payment_status: 'pending' | 'collected' | 'failed' | 'refunded';
  order_status: 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  special_instructions?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  duration_days: number;
  meal_categories_included: string[];
  price: number;
  discount_percentage: number;
  is_active: boolean;
}

export interface SubscriptionMeal {
  id: string;
  subscription_id: string;
  meal_date: string;
  category_id: string;
  status: 'scheduled' | 'skipped' | 'preparing' | 'delivered' | 'cancelled';
  notes?: string;
}

export interface Subscription {
  id: string;
  subscription_number: string;
  customer_id: string;
  plan_id: string;
  plan_name?: string;
  plan_code?: string;
  address_snapshot?: {
    customer_name: string;
    phone_number: string;
    address_line1: string;
    address_line2?: string;
    landmark?: string;
    city: string;
    pincode: string;
  };
  start_date: string;
  end_date: string;
  total_amount: number;
  payment_method: 'cash_on_delivery' | 'cash_on_service';
  payment_status: 'pending' | 'collected' | 'failed' | 'refunded';
  status: 'pending' | 'active' | 'paused' | 'cancelled' | 'completed';
  pause_dates: string[];
  remaining_days?: number;
  scheduled_meals?: SubscriptionMeal[];
  created_at: string;
}

export interface DeliveryArea {
  id: string;
  area_name: string;
  pincode: string;
  is_serviceable: boolean;
  standard_delivery_fee: number;
  estimated_delivery_minutes: number;
}

export interface DashboardMetrics {
  totalOrders: number;
  todayOrdersCount: number;
  pendingOrdersCount: number;
  activeSubscriptionsCount: number;
  totalCustomers: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalSubscriptionRevenue: number;
  recentOrders: Order[];
}
