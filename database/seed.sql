-- ============================================================================
-- HOME KITCHEN – SEED DATA (Valid Hexadecimal UUIDs: 0-9, a-f)
-- ============================================================================

-- 1. Profiles & Admin
INSERT INTO profiles (id, phone_number, full_name, email, role, is_active)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', '+919876543210', 'Kitchen Head Chef', 'admin@homekitchen.com', 'admin', true),
  ('c0000000-0000-0000-0000-000000000001', '+919876543211', 'Ananya Sharma', 'ananya@example.com', 'customer', true)
ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO admin_users (profile_id, permissions, is_active)
SELECT id, '{"can_manage_food": true, "can_manage_orders": true, "can_manage_subscriptions": true, "can_manage_settings": true, "can_view_reports": true}'::jsonb, true
FROM profiles WHERE phone_number = '+919876543210'
ON CONFLICT DO NOTHING;

-- Customer Address
INSERT INTO customer_addresses (profile_id, label, address_line1, address_line2, landmark, city, state, pincode, is_default)
SELECT id, 'Home', 'Flat 402, Green Meadows Apartment', '14th Cross, 4th Main', 'Near Rose Garden Park', 'Bangalore', 'Karnataka', '560034', true
FROM profiles WHERE phone_number = '+919876543211'
ON CONFLICT DO NOTHING;

-- 2. Meal Categories
INSERT INTO meal_categories (id, code, name, description, default_delivery_time, cutoff_hours, is_enabled, display_order)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'breakfast', 'Breakfast', 'Fresh, warm, authentic home breakfast to start your morning energised', '08:00:00', 5, true, 1),
  ('b0000000-0000-0000-0000-000000000002', 'lunch', 'Lunch', 'Wholesome, balanced thalis, meals and rice bowls cooked with cold-pressed oils', '13:00:00', 5, true, 2),
  ('b0000000-0000-0000-0000-000000000003', 'dinner', 'Dinner', 'Light, nutritious and easy to digest home dinners for a peaceful night', '20:00:00', 5, true, 3)
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  cutoff_hours = EXCLUDED.cutoff_hours,
  default_delivery_time = EXCLUDED.default_delivery_time;

-- 3. Meal Slots (Valid Hex UUIDs starting with e)
INSERT INTO meal_slots (id, category_id, slot_time, display_label, max_orders, is_active)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '08:00:00', '7:30 AM - 8:30 AM', 60, true),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '09:00:00', '8:30 AM - 9:30 AM', 60, true),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', '12:30:00', '12:00 PM - 1:00 PM', 80, true),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', '13:30:00', '1:00 PM - 2:00 PM', 80, true),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', '19:30:00', '7:00 PM - 8:00 PM', 70, true),
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', '20:30:00', '8:00 PM - 9:00 PM', 70, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Food Items (Valid Hex UUIDs starting with f)
INSERT INTO food_items (id, category_id, name, description, image_url, base_price, is_veg, is_available, is_active, calories, serving_size)
VALUES
  -- Breakfast
  ('f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Steamed Idli with Sambar & Chutneys (4 pcs)', 'Piping hot fluffy steamed rice cakes served with homemade lentil sambar and fresh coconut chutney.', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', 8000, true, true, true, 260, '4 pieces'),
  ('f0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Crispy Ghee Podi Dosa', 'Golden crisp fermented crepe generously roasted in pure cow ghee and coated with spiced gun powder.', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80', 10000, true, true, true, 340, '1 large dosa'),
  ('f0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Poori Masala Combo (3 pcs)', 'Fluffy deep-fried whole wheat pooris served with lightly spiced potato onion masala and pickle.', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', 9000, true, true, true, 420, '3 pooris + masala'),
  ('f0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Ghee Ven Pongal with Medu Vada', 'Creamy, fragrant moong dal and rice mash tempered with cashews, cumin, and black pepper, accompanied by 1 crispy vada.', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80', 12000, true, true, true, 390, '1 bowl + 1 vada'),

  -- Lunch
  ('f0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'Homestyle South Indian Full Meal', 'Steamed Sona Masoori rice, drumstick sambar, pepper rasam, seasonal vegetable poriyal, curd, and crisp papad.', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80', 14000, true, true, true, 580, 'Complete Thali'),
  ('f0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'Claypot Veg Dum Biryani', 'Aromatic basmati rice layered with garden fresh vegetables, mint, and slow-cooked spices. Served with creamy raitha.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 16000, true, true, true, 510, '500g box + raitha'),
  ('f0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'Soft Phulka Thali (3 Rotis)', 'Three soft oil-free whole wheat phulkas served with paneer butter masala, yellow dal tadka, and carrot-cucumber salad.', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80', 15000, true, true, true, 480, '3 rotis + 2 curries'),
  ('f0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 'Cooling Bagala Bath (Curd Rice)', 'Home-set creamy curd mixed with rice, tempered with mustard, ginger, curry leaves, and topped with sweet pomegranate seeds.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', 9000, true, true, true, 320, '400g bowl'),

  -- Dinner
  ('f0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000003', 'Homestyle Chapati & Mixed Vegetable Kurma', 'Four soft whole wheat chapatis paired with a lightly spiced coconut vegetable kurma.', 'https://images.unsplash.com/photo-1505253758473-96b3d5ebcd96?w=600&auto=format&fit=crop&q=80', 12000, true, true, true, 380, '4 chapatis + kurma'),
  ('f0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000003', 'Soft Kal Dosa with Chutneys (2 pcs)', 'Spongy thick tiffin style dosas cooked with minimal oil, served with tangy tomato and mint chutneys.', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80', 9000, true, true, true, 290, '2 kal dosas + 2 chutneys'),
  ('f0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000003', 'Organic Millet Khichdi Bowl', 'Foxtail millet cooked with yellow lentils, carrots, beans, and soothing ghee tempering. Super light on digestion.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', 13000, true, true, true, 310, '450g bowl'),
  ('f0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000003', 'Fresh Idiyappam with Coconut Milk (4 pcs)', 'Steamed rice string hoppers paired with freshly extracted cardamom sweetened coconut milk.', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', 11000, true, true, true, 280, '4 pcs + coconut milk'),

  -- Non-Veg Meals (Images hosted in Supabase Storage bucket 'mithu')
  -- Non-Veg Breakfast
  ('f0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000001', 'Double Egg Podi Dosa Combo', 'Crispy golden fermented crepe layered with two farm fresh beaten eggs, roasted in pure cow ghee and coated with spiced gun powder. Served with chicken salna & coconut chutney.', 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/egg-dosa.jpg', 13000, false, true, true, 440, '1 large egg dosa + salna'),
  ('f0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000001', 'Homestyle Masala Omelette & Bun Pav (2 pcs)', 'Two fluffy farm egg omelettes whipped with finely chopped shallots, green chillies, curry leaves and ground pepper, served with toasted buttered pav buns.', 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/masala-omelette.jpg', 11000, false, true, true, 380, 'Double omelette + 2 pavs'),

  -- Non-Veg Lunch
  ('f0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000002', 'Homestyle Country Chicken Curry Full Meal', 'Steamed Sona Masoori rice served with tender country-style chicken curry in authentic freshly ground roasted spices, pepper rasam, boiled egg, seasonal poriyal, curd, and papad.', 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/chicken-curry-meal.jpg', 22000, false, true, true, 690, 'Complete Non-Veg Thali'),
  ('f0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000002', 'Claypot Chettinad Chicken Dum Biryani', 'Fragrant seeraga samba rice slow dum-cooked with tender marinated chicken pieces, Chettinad spices, mint, and saffron ghee. Served with boiled egg, spicy chicken gravy salna and curd pachadi.', 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/chicken-biryani.jpg', 24000, false, true, true, 720, '600g pot + egg + raitha'),
  ('f0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000002', 'Coastal Fish Curry Rice Feast', 'Hot steamed Ponni rice served with authentic tangy seer fish curry cooked with kudampuli kokum and small shallots, accompanied by tawa fish fry, pepper rasam, and curd.', 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/fish-curry.jpg', 25000, false, true, true, 610, 'Complete Fish Thali'),

  -- Non-Veg Dinner
  ('f0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000003', 'Malabar Parotta with Chicken Curry (3 pcs)', 'Three handmade flaky multi-layered Kerala parottas paired with slow-simmered homestyle chicken curry cooked with coconut paste, curry leaves, and spices.', 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/parotta-chicken.jpg', 19000, false, true, true, 640, '3 parottas + chicken curry'),
  ('f0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000003', 'Madurai Street-Style Chicken Kothu Parotta', 'Minced flaky parottas beaten on iron griddle with juicy shredded spiced chicken, scrambled eggs, onions, green chillies, and rich chicken salna gravy.', 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/chicken-kothu-parotta.jpg', 18000, false, true, true, 620, '450g box + onion raitha')
ON CONFLICT (id) DO NOTHING;

-- 5. Delivery Areas
INSERT INTO delivery_areas (area_name, pincode, is_serviceable, standard_delivery_fee, estimated_delivery_minutes)
VALUES
  ('Koramangala, Bangalore', '560034', true, 3000, 35),
  ('Indiranagar, Bangalore', '560038', true, 3000, 40),
  ('HSR Layout, Bangalore', '560102', true, 3000, 35),
  ('Mylapore, Chennai', '600004', true, 2500, 30),
  ('Adyar, Chennai', '600020', true, 2500, 30),
  ('Anna Nagar, Chennai', '600040', true, 3000, 40)
ON CONFLICT (pincode) DO NOTHING;

-- 6. Delivery Charges
INSERT INTO delivery_charges (min_order_amount, max_order_amount, charge, is_active)
VALUES
  (0, 29900, 3000, true),      -- Rs 30 delivery for orders below Rs 299
  (29901, NULL, 0, true)       -- Free delivery for orders above Rs 299
ON CONFLICT DO NOTHING;

-- 7. Subscription Plans (Valid Hex UUIDs starting with d)
INSERT INTO subscription_plans (id, code, name, description, duration_days, meal_categories_included, price, discount_percentage, is_active)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'breakfast_only', '7-Day Morning Energiser (Breakfast)', 'Daily fresh South Indian breakfast delivered warm every morning between 7:30 - 8:30 AM.', 7, ARRAY['breakfast'], 65000, 10, true),
  ('d0000000-0000-0000-0000-000000000002', 'lunch_only', '7-Day Homestyle Thali (Lunch)', 'Daily comforting home lunch with alternating menu: meals, phulkas, biryani, and rice combos.', 7, ARRAY['lunch'], 95000, 10, true),
  ('d0000000-0000-0000-0000-000000000003', 'dinner_only', '7-Day Light & Healthy (Dinner)', 'Daily gentle, nutritious dinners including phulkas, khichdi, idiyappam, and kal dosa.', 7, ARRAY['dinner'], 82000, 10, true),
  ('d0000000-0000-0000-0000-000000000004', 'breakfast_lunch', '7-Day Double Care (Breakfast + Lunch)', 'Start your day right and enjoy wholesome lunches delivered directly to your home or desk.', 7, ARRAY['breakfast', 'lunch'], 145000, 12, true),
  ('d0000000-0000-0000-0000-000000000005', 'breakfast_dinner', '7-Day Home Tiffin (Breakfast + Dinner)', 'Ideal for busy working professionals who eat lunch at their office.', 7, ARRAY['breakfast', 'dinner'], 138000, 12, true),
  ('d0000000-0000-0000-0000-000000000006', 'lunch_dinner', '7-Day Twin Feasts (Lunch + Dinner)', 'Zero cooking hassles for lunch and dinner all week long. Wholesome and clean.', 7, ARRAY['lunch', 'dinner'], 162000, 12, true),
  ('d0000000-0000-0000-0000-000000000007', 'all_three_meals', '7-Day Complete Wellness (All 3 Meals)', 'Breakfast, Lunch, and Dinner taken care of completely. Clean ingredients, cold-pressed oils, no preservatives.', 7, ARRAY['breakfast', 'lunch', 'dinner'], 220000, 15, true),
  ('d0000000-0000-0000-0000-000000000008', 'nonveg_lunch_feast', '7-Day Non-Veg Special Feast (Lunch)', 'Daily authentic non-veg home lunch: alternating chicken curry meals, coastal fish feasts, and Chettinad chicken biryani.', 7, ARRAY['lunch'], 145000, 12, true),
  ('d0000000-0000-0000-0000-000000000009', 'nonveg_lunch_dinner', '7-Day Non-Veg Executive Combo (Lunch + Dinner)', 'Wholesome non-veg home dining for lunch and dinner: chicken curry thali, coastal fish curry, Malabar parotta with chicken and kothu parotta.', 7, ARRAY['lunch', 'dinner'], 245000, 15, true)
ON CONFLICT (code) DO NOTHING;

-- 8. Kitchen Settings
INSERT INTO kitchen_settings (setting_key, setting_value, description)
VALUES
  ('kitchen_status', '{"is_open": true, "banner_message": "Kitchen is operating normally. Pre-orders open!"}'::jsonb, 'Global kitchen operational status'),
  ('cutoff_policy', '{"hours": 5, "timezone": "Asia/Kolkata", "allow_emergency_override": false}'::jsonb, 'Lead time cutoff policy'),
  ('capacity_defaults', '{"breakfast": 60, "lunch": 80, "dinner": 70}'::jsonb, 'Default maximum orders capacity per meal slot'),
  ('payments', '{"cash_on_delivery": true, "cash_on_service": true, "online_gateway_active": false}'::jsonb, 'Payment modes configuration'),
  ('whatsapp_notifications', '{"enabled": true, "send_order_confirmed": true, "send_out_for_delivery": true, "send_delivered": true, "send_subscription_update": true}'::jsonb, 'WhatsApp notification triggers')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
