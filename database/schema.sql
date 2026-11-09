-- ============================================================================
-- HOME KITCHEN – CLOUD KITCHEN MANAGEMENT SYSTEM
-- PostgreSQL Database Schema with Row Level Security (RLS)
-- ============================================================================

-- Enable pgcrypto / uuid extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone default to Asia/Kolkata
SET timezone = 'Asia/Kolkata';

-- ============================================================================
-- 1. PROFILES & AUTH
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- References auth.users(id) in Supabase
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'kitchen_staff')),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON profiles(auth_user_id);

-- Admin Users with specialized permissions
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '{"can_manage_food": true, "can_manage_orders": true, "can_manage_subscriptions": true, "can_manage_settings": true, "can_view_reports": true}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_admin_users_profile ON admin_users(profile_id);

-- Customer Addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL DEFAULT 'Home', -- e.g. Home, Work, Other
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    landmark VARCHAR(150),
    city VARCHAR(80) NOT NULL DEFAULT 'Kitchen City',
    state VARCHAR(80) NOT NULL DEFAULT 'Tamil Nadu',
    pincode VARCHAR(10) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_addresses_profile ON customer_addresses(profile_id);
CREATE INDEX IF NOT EXISTS idx_addresses_pincode ON customer_addresses(pincode);

-- ============================================================================
-- 2. MEAL CATEGORIES & SLOTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS meal_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL CHECK (code IN ('breakfast', 'lunch', 'dinner')),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    default_delivery_time TIME NOT NULL, -- 08:00:00, 13:00:00, 20:00:00
    cutoff_hours INTEGER NOT NULL DEFAULT 5 CHECK (cutoff_hours >= 0),
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- Meal delivery time slots within each meal category
CREATE TABLE IF NOT EXISTS meal_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES meal_categories(id) ON DELETE CASCADE,
    slot_time TIME NOT NULL,
    display_label VARCHAR(60) NOT NULL, -- e.g., "7:30 AM - 8:30 AM"
    max_orders INTEGER NOT NULL DEFAULT 100 CHECK (max_orders >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_meal_slots_category ON meal_slots(category_id);

-- ============================================================================
-- 3. FOOD ITEMS & MENUS
-- ============================================================================
CREATE TABLE IF NOT EXISTS food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES meal_categories(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image_url TEXT,
    base_price INTEGER NOT NULL CHECK (base_price >= 0), -- Stored in paise (e.g. 12000 = Rs 120.00)
    is_veg BOOLEAN NOT NULL DEFAULT true,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    calories INTEGER,
    serving_size VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_food_items_active ON food_items(is_active, is_available);

-- Price History to track changes audit-wise
CREATE TABLE IF NOT EXISTS food_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    old_price INTEGER NOT NULL,
    new_price INTEGER NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_price_history_item ON food_price_history(food_item_id);

-- Daily / Scheduled Menus
CREATE TABLE IF NOT EXISTS meal_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_date DATE NOT NULL,
    category_id UUID NOT NULL REFERENCES meal_categories(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    capacity_override INTEGER CHECK (capacity_override >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    CONSTRAINT uq_meal_menus_date_category UNIQUE (menu_date, category_id)
);

CREATE INDEX IF NOT EXISTS idx_meal_menus_date ON meal_menus(menu_date);

-- Items assigned to a specific scheduled menu
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID NOT NULL REFERENCES meal_menus(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    price_override INTEGER CHECK (price_override >= 0), -- In paise, if overridden
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    CONSTRAINT uq_menu_food_item UNIQUE (menu_id, food_item_id)
);

CREATE INDEX IF NOT EXISTS idx_menu_items_menu ON menu_items(menu_id);

-- ============================================================================
-- 4. KITCHEN CAPACITY & SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS meal_capacity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capacity_date DATE NOT NULL,
    category_id UUID NOT NULL REFERENCES meal_categories(id) ON DELETE CASCADE,
    max_capacity INTEGER NOT NULL DEFAULT 60 CHECK (max_capacity >= 0),
    booked_orders INTEGER NOT NULL DEFAULT 0 CHECK (booked_orders >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    CONSTRAINT uq_capacity_date_category UNIQUE (capacity_date, category_id)
);

CREATE INDEX IF NOT EXISTS idx_capacity_date ON meal_capacity(capacity_date);

CREATE TABLE IF NOT EXISTS kitchen_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- ============================================================================
-- 5. DELIVERY MANAGEMENT
-- ============================================================================
CREATE TABLE IF NOT EXISTS delivery_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_name VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) UNIQUE NOT NULL,
    is_serviceable BOOLEAN NOT NULL DEFAULT true,
    standard_delivery_fee INTEGER NOT NULL DEFAULT 3000, -- 30.00 INR in paise
    estimated_delivery_minutes INTEGER NOT NULL DEFAULT 45,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_delivery_areas_pincode ON delivery_areas(pincode);

CREATE TABLE IF NOT EXISTS delivery_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_order_amount INTEGER NOT NULL DEFAULT 0, -- In paise
    max_order_amount INTEGER,                   -- NULL means infinity
    charge INTEGER NOT NULL DEFAULT 3000,        -- In paise
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- ============================================================================
-- 6. SUBSCRIPTION PLANS & USER SUBSCRIPTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'breakfast_only', 'all_three_meals'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL DEFAULT 7 CHECK (duration_days > 0),
    meal_categories_included TEXT[] NOT NULL, -- Array: ['breakfast'], ['breakfast', 'lunch'], etc.
    price INTEGER NOT NULL CHECK (price >= 0), -- Total in paise
    discount_percentage INTEGER NOT NULL DEFAULT 10 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    address_id UUID NOT NULL REFERENCES customer_addresses(id) ON DELETE RESTRICT,
    address_snapshot JSONB NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'cash_on_service' CHECK (payment_method IN ('cash_on_delivery', 'cash_on_service')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'collected', 'failed', 'refunded')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'cancelled', 'completed')),
    pause_dates DATE[] DEFAULT ARRAY[]::DATE[],
    special_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Scheduled daily meals for a subscription
CREATE TABLE IF NOT EXISTS subscription_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    meal_date DATE NOT NULL,
    category_id UUID NOT NULL REFERENCES meal_categories(id) ON DELETE RESTRICT,
    meal_slot_id UUID REFERENCES meal_slots(id),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'skipped', 'preparing', 'delivered', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    CONSTRAINT uq_sub_meal UNIQUE (subscription_id, meal_date, category_id)
);

CREATE INDEX IF NOT EXISTS idx_sub_meals_date ON subscription_meals(meal_date);
CREATE INDEX IF NOT EXISTS idx_sub_meals_sub ON subscription_meals(subscription_id);

-- ============================================================================
-- 7. ORDERS & PRICE SNAPSHOT PROTECTION
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES meal_categories(id) ON DELETE RESTRICT,
    delivery_date DATE NOT NULL,
    delivery_slot VARCHAR(60) NOT NULL,
    address_id UUID REFERENCES customer_addresses(id),
    address_snapshot JSONB NOT NULL, -- Immutable snapshot of customer name, phone, address lines, pincode
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
    delivery_fee INTEGER NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    discount_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'cash_on_delivery' CHECK (payment_method IN ('cash_on_delivery', 'cash_on_service')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'collected', 'failed', 'refunded')),
    order_status VARCHAR(25) NOT NULL DEFAULT 'confirmed' CHECK (order_status IN ('confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
    special_instructions TEXT,
    whatsapp_notified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- Immutable Order Items with price protection snapshot
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE RESTRICT,
    food_name VARCHAR(150) NOT NULL, -- Protected snapshot
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0), -- Snapshot in paise
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price INTEGER NOT NULL CHECK (total_price >= 0), -- Snapshot in paise
    item_snapshot JSONB NOT NULL -- Full immutable snapshot: name, desc, veg/non-veg, original base_price
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Order Status Audit Trail
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(25),
    new_status VARCHAR(25) NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_status_history_order ON order_status_history(order_id);

-- ============================================================================
-- 8. PAYMENTS (Future Gateway Interface & COD Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0), -- In paise
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(30) NOT NULL DEFAULT 'cash_on_delivery',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'collected', 'failed', 'refunded')),
    gateway_provider VARCHAR(50), -- e.g. 'razorpay' in future; NULL for now
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    gateway_signature VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);

CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- ============================================================================
-- 9. WHATSAPP NOTIFICATIONS (Outbox Pattern & Consent)
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_whatsapp_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    phone_number VARCHAR(15) NOT NULL,
    is_opted_in BOOLEAN NOT NULL DEFAULT true,
    consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    CONSTRAINT uq_customer_whatsapp UNIQUE (profile_id, phone_number)
);

CREATE TABLE IF NOT EXISTS notification_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (recipient_type IN ('customer', 'admin')),
    event_type VARCHAR(50) NOT NULL, -- order_confirmed, out_for_delivery, delivered, subscription_activated, etc.
    template_name VARCHAR(100) NOT NULL,
    template_params JSONB NOT NULL,
    reference_id UUID, -- order_id or subscription_id
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outbox_status_retry ON notification_outbox(status, next_retry_at);

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outbox_id UUID REFERENCES notification_outbox(id) ON DELETE SET NULL,
    whatsapp_message_id VARCHAR(100),
    recipient_phone VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,
    response_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- ============================================================================
-- 10. AUDIT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);

-- ============================================================================
-- 11. TRIGGERS & PROCEDURES
-- ============================================================================

-- Generic update timestamp trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('Asia/Kolkata', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_food_items
BEFORE UPDATE ON food_items
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_subscriptions
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_meal_categories
BEFORE UPDATE ON meal_categories
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_capacity
BEFORE UPDATE ON meal_capacity
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger to track price changes automatically
CREATE OR REPLACE FUNCTION log_food_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.base_price IS DISTINCT FROM NEW.base_price THEN
        INSERT INTO food_price_history (food_item_id, old_price, new_price)
        VALUES (NEW.id, OLD.base_price, NEW.base_price);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_food_price_change
AFTER UPDATE ON food_items
FOR EACH ROW EXECUTE FUNCTION log_food_price_change();

-- Trigger to track order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.order_status IS DISTINCT FROM NEW.order_status THEN
        INSERT INTO order_status_history (order_id, old_status, new_status, note)
        VALUES (NEW.id, OLD.order_status, NEW.order_status, 'Status updated automatically or by admin');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_whatsapp_consents ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE auth_user_id = auth.uid() AND role IN ('admin', 'kitchen_staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public can read enabled categories, foods, menus, delivery areas, active subscription plans
CREATE POLICY "Public read meal_categories" ON meal_categories FOR SELECT USING (is_enabled = true OR is_admin());
CREATE POLICY "Public read food_items" ON food_items FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Public read meal_menus" ON meal_menus FOR SELECT USING (is_enabled = true OR is_admin());
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (is_available = true OR is_admin());
CREATE POLICY "Public read meal_slots" ON meal_slots FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Public read delivery_areas" ON delivery_areas FOR SELECT USING (is_serviceable = true OR is_admin());
CREATE POLICY "Public read delivery_charges" ON delivery_charges FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Public read subscription_plans" ON subscription_plans FOR SELECT USING (is_active = true OR is_admin());

-- Customers can read/update their own profile
CREATE POLICY "Customer view own profile" ON profiles FOR SELECT USING (auth_user_id = auth.uid() OR is_admin());
CREATE POLICY "Customer update own profile" ON profiles FOR UPDATE USING (auth_user_id = auth.uid() OR is_admin());

-- Customer addresses
CREATE POLICY "Customer manage own addresses" ON customer_addresses FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin()
);

-- Orders
CREATE POLICY "Customer view own orders" ON orders FOR SELECT USING (
    customer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin()
);
CREATE POLICY "Customer insert own orders" ON orders FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin()
);

-- Order Items
CREATE POLICY "Customer view own order items" ON order_items FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE customer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())) OR is_admin()
);

-- Subscriptions
CREATE POLICY "Customer view own subscriptions" ON subscriptions FOR SELECT USING (
    customer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin()
);
CREATE POLICY "Customer insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin()
);

-- Subscription Meals
CREATE POLICY "Customer view own subscription meals" ON subscription_meals FOR SELECT USING (
    subscription_id IN (SELECT id FROM subscriptions WHERE customer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())) OR is_admin()
);

-- Admin Full Access Policies
CREATE POLICY "Admin full meal_categories" ON meal_categories FOR ALL USING (is_admin());
CREATE POLICY "Admin full food_items" ON food_items FOR ALL USING (is_admin());
CREATE POLICY "Admin full meal_menus" ON meal_menus FOR ALL USING (is_admin());
CREATE POLICY "Admin full menu_items" ON menu_items FOR ALL USING (is_admin());
CREATE POLICY "Admin full meal_slots" ON meal_slots FOR ALL USING (is_admin());
CREATE POLICY "Admin full meal_capacity" ON meal_capacity FOR ALL USING (is_admin());
CREATE POLICY "Admin full delivery_areas" ON delivery_areas FOR ALL USING (is_admin());
CREATE POLICY "Admin full delivery_charges" ON delivery_charges FOR ALL USING (is_admin());
CREATE POLICY "Admin full subscription_plans" ON subscription_plans FOR ALL USING (is_admin());
CREATE POLICY "Admin full orders" ON orders FOR ALL USING (is_admin());
CREATE POLICY "Admin full subscriptions" ON subscriptions FOR ALL USING (is_admin());
CREATE POLICY "Admin full payments" ON payments FOR ALL USING (is_admin());
CREATE POLICY "Admin full notification_outbox" ON notification_outbox FOR ALL USING (is_admin());
