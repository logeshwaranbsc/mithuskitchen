# HOME KITCHEN – REST API DOCUMENTATION

This document provides a comprehensive overview of all RESTful API endpoints available in the **HOME KITCHEN** cloud kitchen management system under `/api/v1`.

---

## 1. Authentication Endpoints

### 1.1 Request OTP for Mobile Login
- **Endpoint:** `POST /api/v1/auth/send-otp`
- **Request Body:**
```json
{
  "phone_number": "+919876543211"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your mobile number"
}
```

### 1.2 Verify OTP & Issue Session Token
- **Endpoint:** `POST /api/v1/auth/verify-token`
- **Request Body:**
```json
{
  "phone_number": "+919876543211",
  "otp": "123456",
  "full_name": "Ananya Sharma"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c0000000-0000-0000-0000-000000000001",
      "phone_number": "+919876543211",
      "full_name": "Ananya Sharma",
      "role": "customer"
    }
  }
}
```

### 1.3 Admin Secure Login
- **Endpoint:** `POST /api/v1/auth/admin-login`
- **Request Body:**
```json
{
  "phone_number": "+919876543210",
  "password": "admin"
}
```

---

## 2. Food Management Endpoints

### 2.1 Get Foods List
- **Endpoint:** `GET /api/v1/foods`
- **Query Parameters:** `category_id`, `is_veg`, `is_active`, `is_available`, `search`

### 2.2 Create Food Item (Admin)
- **Endpoint:** `POST /api/v1/foods/admin`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Request Body:**
```json
{
  "category_id": "b0000000-0000-0000-0000-000000000002",
  "name": "Special Veg Biryani",
  "description": "Slow-cooked fragrant rice with garden vegetables",
  "base_price": 16000,
  "image_url": "https://images.unsplash.com/...",
  "is_veg": true,
  "is_available": true
}
```

---

## 3. Order Endpoints (Price Protected)

### 3.1 Place Customer Order
- **Endpoint:** `POST /api/v1/orders/customer`
- **Headers:** `Authorization: Bearer <CUSTOMER_JWT>`
- **Request Body:**
```json
{
  "category_id": "b0000000-0000-0000-0000-000000000002",
  "delivery_date": "2026-11-10",
  "delivery_slot": "12:00 PM - 1:00 PM",
  "delivery_address": {
    "customer_name": "Ananya Sharma",
    "phone_number": "+919876543211",
    "address_line1": "Flat 402, Green Meadows",
    "city": "Bangalore",
    "pincode": "560034"
  },
  "items": [
    { "food_item_id": "f0000000-0000-0000-0000-000000000005", "quantity": 2 }
  ],
  "payment_method": "cash_on_delivery",
  "whatsapp_opt_in": true
}
```

### 3.2 Update Order Status (Admin)
- **Endpoint:** `PATCH /api/v1/orders/admin/:id/status`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Request Body:**
```json
{
  "status": "out_for_delivery",
  "payment_status": "pending",
  "note": "Dispatched with driver Suresh"
}
```

---

## 4. Weekly Subscriptions (7-Day Duration)

### 4.1 Get Subscription Plans
- **Endpoint:** `GET /api/v1/subscriptions/plans`

### 4.2 Activate Customer 7-Day Subscription
- **Endpoint:** `POST /api/v1/subscriptions/customer`
- **Headers:** `Authorization: Bearer <CUSTOMER_JWT>`
- **Request Body:**
```json
{
  "plan_id": "d0000000-0000-0000-0000-000000000001",
  "start_date": "2026-11-10",
  "delivery_address": {
    "customer_name": "Ananya Sharma",
    "phone_number": "+919876543211",
    "address_line1": "Flat 402, Green Meadows",
    "city": "Bangalore",
    "pincode": "560034"
  },
  "payment_method": "cash_on_service"
}
```

---

## 5. Reports & Analytics

- `GET /api/v1/reports/dashboard` - Real-time metrics
- `GET /api/v1/reports/daily` - Daily sales breakdown
- `GET /api/v1/reports/food-wise` - Top selling dishes
- `GET /api/v1/reports/export-csv` - Download CSV orders ledger

---

## 6. WhatsApp Cloud API Webhooks

- `GET /api/v1/webhooks/whatsapp` - Meta webhook handshake challenge
- `POST /api/v1/webhooks/whatsapp` - Inbound delivery events
- `GET /api/v1/webhooks/notifications` - Admin notification outbox & dispatch history
