import { v4 as uuidv4 } from 'uuid';

export interface Profile {
  id: string;
  phone_number: string;
  full_name: string;
  email: string | null;
  role: 'customer' | 'admin' | 'kitchen_staff';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

export interface MealSlot {
  id: string;
  category_id: string;
  slot_time: string;
  display_label: string;
  max_orders: number;
  is_active: boolean;
  created_at: string;
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
  created_at: string;
  updated_at: string;
}

export interface FoodPriceHistory {
  id: string;
  food_item_id: string;
  old_price: number;
  new_price: number;
  changed_by?: string;
  changed_at: string;
  reason?: string;
}

export interface MealMenu {
  id: string;
  menu_date: string; // YYYY-MM-DD
  category_id: string;
  is_enabled: boolean;
  capacity_override?: number;
  notes?: string;
  created_at: string;
}

export interface MenuItem {
  id: string;
  menu_id: string;
  food_item_id: string;
  price_override?: number;
  is_available: boolean;
  created_at: string;
}

export interface MealCapacity {
  id: string;
  capacity_date: string;
  category_id: string;
  max_capacity: number;
  booked_orders: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryArea {
  id: string;
  area_name: string;
  pincode: string;
  is_serviceable: boolean;
  standard_delivery_fee: number; // paise
  estimated_delivery_minutes: number;
  created_at: string;
}

export interface DeliveryCharge {
  id: string;
  min_order_amount: number;
  max_order_amount: number | null;
  charge: number;
  is_active: boolean;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  duration_days: number;
  meal_categories_included: string[];
  price: number; // paise
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  subscription_number: string;
  customer_id: string;
  plan_id: string;
  address_id: string;
  address_snapshot: any;
  start_date: string;
  end_date: string;
  total_amount: number; // paise
  payment_method: 'cash_on_delivery' | 'cash_on_service';
  payment_status: 'pending' | 'collected' | 'failed' | 'refunded';
  status: 'pending' | 'active' | 'paused' | 'cancelled' | 'completed';
  pause_dates: string[];
  special_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionMeal {
  id: string;
  subscription_id: string;
  meal_date: string;
  category_id: string;
  meal_slot_id?: string;
  status: 'scheduled' | 'skipped' | 'preparing' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_item_id: string;
  food_name: string;
  unit_price: number; // paise
  quantity: number;
  total_price: number; // paise
  item_snapshot: any;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  category_id: string;
  delivery_date: string;
  delivery_slot: string;
  address_id?: string;
  address_snapshot: any;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cash_on_delivery' | 'cash_on_service';
  payment_status: 'pending' | 'collected' | 'failed' | 'refunded';
  order_status: 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  special_instructions?: string;
  whatsapp_notified: boolean;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  note?: string;
  created_at: string;
}

export interface NotificationOutbox {
  id: string;
  recipient_phone: string;
  recipient_type: 'customer' | 'admin';
  event_type: string;
  template_name: string;
  template_params: any;
  reference_id?: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  retry_count: number;
  max_retries: number;
  next_retry_at: string;
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

export interface NotificationLog {
  id: string;
  outbox_id?: string;
  whatsapp_message_id?: string;
  recipient_phone: string;
  status: string;
  response_payload?: any;
  created_at: string;
}

class InMemoryStore {
  profiles: Profile[] = [];
  customer_addresses: CustomerAddress[] = [];
  meal_categories: MealCategory[] = [];
  meal_slots: MealSlot[] = [];
  food_items: FoodItem[] = [];
  food_price_history: FoodPriceHistory[] = [];
  meal_menus: MealMenu[] = [];
  menu_items: MenuItem[] = [];
  meal_capacity: MealCapacity[] = [];
  delivery_areas: DeliveryArea[] = [];
  delivery_charges: DeliveryCharge[] = [];
  subscription_plans: SubscriptionPlan[] = [];
  subscriptions: Subscription[] = [];
  subscription_meals: SubscriptionMeal[] = [];
  orders: Order[] = [];
  order_items: OrderItem[] = [];
  order_status_history: OrderStatusHistory[] = [];
  notification_outbox: NotificationOutbox[] = [];
  notification_logs: NotificationLog[] = [];
  kitchen_settings: Record<string, any> = {};

  constructor() {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();

    // Profiles
    this.profiles = [
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        phone_number: '+919876543210',
        full_name: 'Kitchen Head Chef',
        email: 'admin@homekitchen.com',
        role: 'admin',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        phone_number: '+919876543211',
        full_name: 'Ananya Sharma',
        email: 'ananya@example.com',
        role: 'customer',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ];

    // Customer Address
    this.customer_addresses = [
      {
        id: 'addr-001',
        profile_id: 'c0000000-0000-0000-0000-000000000001',
        label: 'Home',
        address_line1: 'Flat 402, Green Meadows Apartment',
        address_line2: '14th Cross, 4th Main',
        landmark: 'Near Rose Garden Park',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
        is_default: true,
        created_at: now,
        updated_at: now,
      },
    ];

    // Categories
    this.meal_categories = [
      {
        id: 'cat-breakfast',
        code: 'breakfast',
        name: 'Breakfast',
        description: 'Fresh, warm, authentic home breakfast to start your morning energised',
        default_delivery_time: '08:00:00',
        cutoff_hours: 5,
        is_enabled: true,
        display_order: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cat-lunch',
        code: 'lunch',
        name: 'Lunch',
        description: 'Wholesome, balanced thalis, meals and rice bowls cooked with cold-pressed oils',
        default_delivery_time: '13:00:00',
        cutoff_hours: 5,
        is_enabled: true,
        display_order: 2,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cat-dinner',
        code: 'dinner',
        name: 'Dinner',
        description: 'Light, nutritious and easy to digest home dinners for a peaceful night',
        default_delivery_time: '20:00:00',
        cutoff_hours: 5,
        is_enabled: true,
        display_order: 3,
        created_at: now,
        updated_at: now,
      },
    ];

    // Meal Slots
    this.meal_slots = [
      {
        id: 'slot-b1',
        category_id: 'cat-breakfast',
        slot_time: '08:00:00',
        display_label: '7:30 AM - 8:30 AM',
        max_orders: 60,
        is_active: true,
        created_at: now,
      },
      {
        id: 'slot-b2',
        category_id: 'cat-breakfast',
        slot_time: '09:00:00',
        display_label: '8:30 AM - 9:30 AM',
        max_orders: 60,
        is_active: true,
        created_at: now,
      },
      {
        id: 'slot-l1',
        category_id: 'cat-lunch',
        slot_time: '12:30:00',
        display_label: '12:00 PM - 1:00 PM',
        max_orders: 80,
        is_active: true,
        created_at: now,
      },
      {
        id: 'slot-l2',
        category_id: 'cat-lunch',
        slot_time: '13:30:00',
        display_label: '1:00 PM - 2:00 PM',
        max_orders: 80,
        is_active: true,
        created_at: now,
      },
      {
        id: 'slot-d1',
        category_id: 'cat-dinner',
        slot_time: '19:30:00',
        display_label: '7:00 PM - 8:00 PM',
        max_orders: 70,
        is_active: true,
        created_at: now,
      },
      {
        id: 'slot-d2',
        category_id: 'cat-dinner',
        slot_time: '20:30:00',
        display_label: '8:00 PM - 9:00 PM',
        max_orders: 70,
        is_active: true,
        created_at: now,
      },
    ];

    // Foods
    this.food_items = [
      // Breakfast
      {
        id: 'food-01',
        category_id: 'cat-breakfast',
        name: 'Steamed Idli with Sambar & Chutneys (4 pcs)',
        description: 'Piping hot fluffy steamed rice cakes served with homemade lentil sambar and fresh coconut chutney.',
        image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        base_price: 8000,
        is_veg: true,
        is_available: true,
        is_active: true,
        calories: 260,
        serving_size: '4 pieces',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-02',
        category_id: 'cat-breakfast',
        name: 'Crispy Ghee Podi Dosa',
        description: 'Golden crisp fermented crepe generously roasted in pure cow ghee and coated with spiced gun powder.',
        image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
        base_price: 10000,
        is_veg: true,
        is_available: true,
        is_active: true,
        calories: 340,
        serving_size: '1 large dosa',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-03',
        category_id: 'cat-breakfast',
        name: 'Poori Masala Combo (3 pcs)',
        description: 'Fluffy deep-fried whole wheat pooris served with lightly spiced potato onion masala and pickle.',
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        base_price: 9000,
        is_veg: true,
        is_available: true,
        is_active: true,
        calories: 420,
        serving_size: '3 pooris + masala',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-04',
        category_id: 'cat-breakfast',
        name: 'Ghee Ven Pongal with Medu Vada',
        description: 'Creamy moong dal and rice mash tempered with cashews, cumin, and black pepper, served with 1 crispy vada.',
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        base_price: 12000,
        is_veg: true,
        is_available: true,
        is_active: true,
        calories: 390,
        serving_size: '1 bowl + 1 vada',
        created_at: now,
        updated_at: now,
      },
      // Lunch
      {
        id: 'food-05',
        category_id: 'cat-lunch',
        name: 'Homestyle South Indian Full Meal',
        description: 'Steamed Sona Masoori rice, drumstick sambar, pepper rasam, seasonal vegetable poriyal, curd, and crisp papad.',
        image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
        base_price: 14000,
        is_veg: true,
        is_available: true,
        is_active: true,
        calories: 580,
        serving_size: 'Complete Thali',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-06',
        category_id: 'cat-lunch',
        name: 'Claypot Veg Dum Biryani',
        description: 'Aromatic basmati rice layered with garden fresh vegetables, mint, and slow-cooked spices. Served with creamy raitha.',
        image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
        base_price: 16000,
        is_veg: true,
        is_available: true,
        is_active: true,
        calories: 510,
        serving_size: '500g box + raitha',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-07',
        category_id: 'cat-lunch',
        name: 'Soft Phulka Thali (3 Rotis)',
        description: 'Three soft oil-free whole wheat phulkas served with paneer butter masala, yellow dal tadka, and salad.',
        image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
        base_price: 15000,
        is_veg: true,
        is_available: true,
        is_active: true,
        calories: 480,
        serving_size: '3 rotis + 2 curries',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-08',
        category_id: 'cat-lunch',
        name: 'Cooling Bagala Bath (Curd Rice)',
        description: 'Home-set creamy curd mixed with rice, tempered with mustard, ginger, curry leaves, and topped with pomegranate.',
        image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        base_price: 9000,
        is_veg: true,
        is_available: true,
        is_active: true,
        calories: 320,
        serving_size: '400g bowl',
        created_at: now,
        updated_at: now,
      },
      // Dinner
      {
        id: 'food-09',
        category_id: 'cat-dinner',
        name: 'Homestyle Chapati & Mixed Veg Kurma',
        description: 'Four soft whole wheat chapatis paired with a lightly spiced coconut vegetable kurma.',
        image_url: 'https://images.unsplash.com/photo-1505253758473-96b3d5ebcd96?w=600&auto=format&fit=crop&q=80',
        base_price: 12000,
        is_veg: true,
        is_available: true,
        is_active: true,
        calories: 380,
        serving_size: '4 chapatis + kurma',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-10',
        category_id: 'cat-dinner',
        name: 'Soft Kal Dosa with Chutneys (2 pcs)',
        description: 'Spongy thick tiffin style dosas cooked with minimal oil, served with tangy tomato and mint chutneys.',
        image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
        base_price: 9000,
        is_veg: true,
        is_available: true,
        is_active: true,
        calories: 290,
        serving_size: '2 kal dosas + 2 chutneys',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-11',
        category_id: 'cat-dinner',
        name: 'Organic Millet Khichdi Bowl',
        description: 'Foxtail millet cooked with yellow lentils, carrots, beans, and soothing ghee tempering. Super light on digestion.',
        image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        base_price: 13000,
        is_veg: true,
        is_available: true,
        is_active: true,
        calories: 310,
        serving_size: '450g bowl',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-12',
        category_id: 'cat-dinner',
        name: 'Fresh Idiyappam with Coconut Milk (4 pcs)',
        description: 'Steamed rice string hoppers paired with freshly extracted cardamom sweetened coconut milk.',
        image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        base_price: 11000,
        is_veg: true,
        is_available: true,
        is_active: true,
        calories: 280,
        serving_size: '4 pcs + coconut milk',
        created_at: now,
        updated_at: now,
      },
      // Non-Veg Breakfast
      {
        id: 'food-nv-01',
        category_id: 'cat-breakfast',
        name: 'Double Egg Podi Dosa Combo',
        description: 'Crispy golden fermented crepe layered with two farm fresh beaten eggs, roasted in pure cow ghee and coated with spiced gun powder. Served with chicken salna & coconut chutney.',
        image_url: 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/egg-dosa.jpg',
        base_price: 13000,
        is_veg: false,
        is_available: true,
        is_active: true,
        calories: 440,
        serving_size: '1 large egg dosa + salna',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-nv-02',
        category_id: 'cat-breakfast',
        name: 'Homestyle Masala Omelette & Bun Pav (2 pcs)',
        description: 'Two fluffy farm egg omelettes whipped with finely chopped shallots, green chillies, curry leaves and ground pepper, served with toasted buttered pav buns.',
        image_url: 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/masala-omelette.jpg',
        base_price: 11000,
        is_veg: false,
        is_available: true,
        is_active: true,
        calories: 380,
        serving_size: 'Double omelette + 2 pavs',
        created_at: now,
        updated_at: now,
      },
      // Non-Veg Lunch
      {
        id: 'food-nv-03',
        category_id: 'cat-lunch',
        name: 'Homestyle Country Chicken Curry Full Meal',
        description: 'Steamed Sona Masoori rice served with tender country-style chicken curry in authentic freshly ground roasted spices, pepper rasam, boiled egg, seasonal poriyal, curd, and papad.',
        image_url: 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/chicken-curry-meal.jpg',
        base_price: 22000,
        is_veg: false,
        is_available: true,
        is_active: true,
        calories: 690,
        serving_size: 'Complete Non-Veg Thali',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-nv-04',
        category_id: 'cat-lunch',
        name: 'Claypot Chettinad Chicken Dum Biryani',
        description: 'Fragrant seeraga samba rice slow dum-cooked with tender marinated chicken pieces, Chettinad spices, mint, and saffron ghee. Served with boiled egg, spicy chicken gravy salna and curd pachadi.',
        image_url: 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/chicken-biryani.jpg',
        base_price: 24000,
        is_veg: false,
        is_available: true,
        is_active: true,
        calories: 720,
        serving_size: '600g pot + egg + raitha',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-nv-05',
        category_id: 'cat-lunch',
        name: 'Coastal Fish Curry Rice Feast',
        description: 'Hot steamed Ponni rice served with authentic tangy seer fish curry cooked with kudampuli kokum and small shallots, accompanied by tawa fish fry, pepper rasam, and curd.',
        image_url: 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/fish-curry.jpg',
        base_price: 25000,
        is_veg: false,
        is_available: true,
        is_active: true,
        calories: 610,
        serving_size: 'Complete Fish Thali',
        created_at: now,
        updated_at: now,
      },
      // Non-Veg Dinner
      {
        id: 'food-nv-06',
        category_id: 'cat-dinner',
        name: 'Malabar Parotta with Chicken Curry (3 pcs)',
        description: 'Three handmade flaky multi-layered Kerala parottas paired with slow-simmered homestyle chicken curry cooked with coconut paste, curry leaves, and spices.',
        image_url: 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/parotta-chicken.jpg',
        base_price: 19000,
        is_veg: false,
        is_available: true,
        is_active: true,
        calories: 640,
        serving_size: '3 parottas + chicken curry',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'food-nv-07',
        category_id: 'cat-dinner',
        name: 'Madurai Street-Style Chicken Kothu Parotta',
        description: 'Minced flaky parottas beaten on iron griddle with juicy shredded spiced chicken, scrambled eggs, onions, green chillies, and rich chicken salna gravy.',
        image_url: 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/chicken-kothu-parotta.jpg',
        base_price: 18000,
        is_veg: false,
        is_available: true,
        is_active: true,
        calories: 620,
        serving_size: '450g box + onion raitha',
        created_at: now,
        updated_at: now,
      },
    ];

    // Delivery Areas
    this.delivery_areas = [
      {
        id: 'area-1',
        area_name: 'Koramangala, Bangalore',
        pincode: '560034',
        is_serviceable: true,
        standard_delivery_fee: 3000,
        estimated_delivery_minutes: 35,
        created_at: now,
      },
      {
        id: 'area-2',
        area_name: 'Indiranagar, Bangalore',
        pincode: '560038',
        is_serviceable: true,
        standard_delivery_fee: 3000,
        estimated_delivery_minutes: 40,
        created_at: now,
      },
      {
        id: 'area-3',
        area_name: 'HSR Layout, Bangalore',
        pincode: '560102',
        is_serviceable: true,
        standard_delivery_fee: 3000,
        estimated_delivery_minutes: 35,
        created_at: now,
      },
      {
        id: 'area-4',
        area_name: 'Mylapore, Chennai',
        pincode: '600004',
        is_serviceable: true,
        standard_delivery_fee: 2500,
        estimated_delivery_minutes: 30,
        created_at: now,
      },
      {
        id: 'area-5',
        area_name: 'Adyar, Chennai',
        pincode: '600020',
        is_serviceable: true,
        standard_delivery_fee: 2500,
        estimated_delivery_minutes: 30,
        created_at: now,
      },
    ];

    // Delivery Charges
    this.delivery_charges = [
      {
        id: 'charge-1',
        min_order_amount: 0,
        max_order_amount: 29900,
        charge: 3000,
        is_active: true,
        created_at: now,
      },
      {
        id: 'charge-2',
        min_order_amount: 29901,
        max_order_amount: null,
        charge: 0,
        is_active: true,
        created_at: now,
      },
    ];

    // Subscription Plans
    this.subscription_plans = [
      {
        id: 'plan-1',
        code: 'breakfast_only',
        name: '7-Day Morning Energiser (Breakfast)',
        description: 'Daily fresh South Indian breakfast delivered warm every morning between 7:30 - 8:30 AM.',
        duration_days: 7,
        meal_categories_included: ['breakfast'],
        price: 65000, // Rs 650
        discount_percentage: 10,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'plan-2',
        code: 'lunch_only',
        name: '7-Day Homestyle Thali (Lunch)',
        description: 'Daily comforting home lunch with alternating menu: meals, phulkas, biryani, and curd rice combos.',
        duration_days: 7,
        meal_categories_included: ['lunch'],
        price: 95000, // Rs 950
        discount_percentage: 10,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'plan-3',
        code: 'dinner_only',
        name: '7-Day Light & Healthy (Dinner)',
        description: 'Daily gentle, nutritious dinners including phulkas, khichdi, idiyappam, and kal dosa.',
        duration_days: 7,
        meal_categories_included: ['dinner'],
        price: 82000, // Rs 820
        discount_percentage: 10,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'plan-4',
        code: 'breakfast_lunch',
        name: '7-Day Double Care (Breakfast + Lunch)',
        description: 'Start your day right and enjoy wholesome lunches delivered directly to your home or desk.',
        duration_days: 7,
        meal_categories_included: ['breakfast', 'lunch'],
        price: 145000, // Rs 1450
        discount_percentage: 12,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'plan-5',
        code: 'lunch_dinner',
        name: '7-Day Twin Feasts (Lunch + Dinner)',
        description: 'Zero cooking hassles for lunch and dinner all week long. Freshly prepared homestyle food.',
        duration_days: 7,
        meal_categories_included: ['lunch', 'dinner'],
        price: 162000, // Rs 1620
        discount_percentage: 12,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'plan-6',
        code: 'all_three_meals',
        name: '7-Day Complete Wellness (All 3 Meals)',
        description: 'Breakfast, Lunch, and Dinner taken care of completely. Clean ingredients, cold-pressed oils, no preservatives.',
        duration_days: 7,
        meal_categories_included: ['breakfast', 'lunch', 'dinner'],
        price: 220000, // Rs 2200
        discount_percentage: 15,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'plan-nv-1',
        code: 'nonveg_lunch_feast',
        name: '7-Day Non-Veg Special Feast (Lunch)',
        description: 'Daily authentic non-veg home lunch: alternating chicken curry meals, coastal fish feasts, and Chettinad chicken biryani.',
        duration_days: 7,
        meal_categories_included: ['lunch'],
        price: 145000, // Rs 1450
        discount_percentage: 12,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'plan-nv-2',
        code: 'nonveg_lunch_dinner',
        name: '7-Day Non-Veg Executive Combo (Lunch + Dinner)',
        description: 'Wholesome non-veg home dining for lunch and dinner: chicken curry thali, coastal fish curry, Malabar parotta with chicken and kothu parotta.',
        duration_days: 7,
        meal_categories_included: ['lunch', 'dinner'],
        price: 245000, // Rs 2450
        discount_percentage: 15,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ];

    // Seed Sample Orders
    const sampleOrder1: Order = {
      id: 'ord-1001',
      order_number: 'HK-20261109-001',
      customer_id: 'c0000000-0000-0000-0000-000000000001',
      category_id: 'cat-lunch',
      delivery_date: '2026-11-09',
      delivery_slot: '12:00 PM - 1:00 PM',
      address_id: 'addr-001',
      address_snapshot: {
        customer_name: 'Ananya Sharma',
        phone_number: '+919876543211',
        address_line1: 'Flat 402, Green Meadows Apartment',
        address_line2: '14th Cross, 4th Main',
        city: 'Bangalore',
        pincode: '560034',
      },
      subtotal: 30000,
      delivery_fee: 0,
      discount_amount: 0,
      total_amount: 30000,
      payment_method: 'cash_on_delivery',
      payment_status: 'pending',
      order_status: 'preparing',
      special_instructions: 'Please keep spices moderate.',
      whatsapp_notified: true,
      created_at: now,
      updated_at: now,
    };

    const sampleItem1: OrderItem = {
      id: 'item-1001',
      order_id: 'ord-1001',
      food_item_id: 'food-05',
      food_name: 'Homestyle South Indian Full Meal',
      unit_price: 14000,
      quantity: 1,
      total_price: 14000,
      item_snapshot: { name: 'Homestyle South Indian Full Meal', base_price: 14000 },
    };

    const sampleItem2: OrderItem = {
      id: 'item-1002',
      order_id: 'ord-1001',
      food_item_id: 'food-06',
      food_name: 'Claypot Veg Dum Biryani',
      unit_price: 16000,
      quantity: 1,
      total_price: 16000,
      item_snapshot: { name: 'Claypot Veg Dum Biryani', base_price: 16000 },
    };

    sampleOrder1.items = [sampleItem1, sampleItem2];
    this.orders.push(sampleOrder1);
    this.order_items.push(sampleItem1, sampleItem2);

    this.order_status_history.push({
      id: 'hist-1',
      order_id: 'ord-1001',
      old_status: 'confirmed',
      new_status: 'preparing',
      changed_by: 'a0000000-0000-0000-0000-000000000001',
      note: 'Chef started preparation in kitchen',
      created_at: now,
    });

    // Kitchen settings
    this.kitchen_settings = {
      kitchen_status: { is_open: true, banner_message: 'Kitchen is operating normally. Fresh meals ready!' },
      cutoff_policy: { hours: 5, timezone: 'Asia/Kolkata', allow_emergency_override: false },
      capacity_defaults: { breakfast: 60, lunch: 80, dinner: 70 },
      payments: { cash_on_delivery: true, cash_on_service: true, online_gateway_active: false },
      whatsapp_notifications: { enabled: true, send_order_confirmed: true, send_out_for_delivery: true, send_delivered: true },
    };
  }
}

export const inMemoryStore = new InMemoryStore();
