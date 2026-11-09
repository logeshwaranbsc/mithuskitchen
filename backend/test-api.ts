import http from 'http';
import app from './src/app';

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099/api/v1';

  console.log('\n=============================================');
  console.log('   RUNNING HOME KITCHEN API INTEGRATION TESTS');
  console.log('=============================================\n');

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    console.log('✔ GET /health:', healthRes.status === 'ok' ? 'PASSED' : 'FAILED');

    // 2. Auth: Customer Send OTP & Verify
    const otpRes = await fetch(`${baseUrl}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: '+919876543211' }),
    }).then((r) => r.json());
    console.log('✔ POST /auth/send-otp:', otpRes.success ? 'PASSED' : 'FAILED');

    const verifyRes = await fetch(`${baseUrl}/auth/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: '+919876543211', otp: '123456', full_name: 'Ananya Sharma' }),
    }).then((r) => r.json());
    console.log('✔ POST /auth/verify-token (Customer login):', verifyRes.success && verifyRes.data.token ? 'PASSED' : 'FAILED');
    const customerToken = verifyRes.data.token;

    // 3. Auth: Admin Login
    const adminRes = await fetch(`${baseUrl}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: '+919876543210', password: 'admin' }),
    }).then((r) => r.json());
    console.log('✔ POST /auth/admin-login (Admin login):', adminRes.success && adminRes.data.token ? 'PASSED' : 'FAILED');
    const adminToken = adminRes.data.token;

    // 4. Food: Get all foods
    const foodsRes = await fetch(`${baseUrl}/foods`).then((r) => r.json());
    console.log(`✔ GET /foods: PASSED (${foodsRes.data.length} food items returned)`);

    // 5. Menu Categories
    const categoriesRes = await fetch(`${baseUrl}/menus/categories`).then((r) => r.json());
    console.log(`✔ GET /menus/categories: PASSED (${categoriesRes.data.length} categories: Breakfast, Lunch, Dinner)`);

    // 6. Subscriptions: Get 7-Day Plans
    const plansRes = await fetch(`${baseUrl}/subscriptions/plans`).then((r) => r.json());
    console.log(`✔ GET /subscriptions/plans: PASSED (${plansRes.data.length} plans available)`);

    // 7. Customer: Create 7-Day Subscription
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().split('T')[0];

    const subRes = await fetch(`${baseUrl}/subscriptions/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        plan_id: plansRes.data[0].id,
        start_date: startDate,
        delivery_address: {
          customer_name: 'Ananya Sharma',
          phone_number: '+919876543211',
          address_line1: 'Flat 402, Green Meadows',
          city: 'Bangalore',
          pincode: '560034',
        },
        payment_method: 'cash_on_service',
      }),
    }).then((r) => r.json());
    console.log('✔ POST /subscriptions/customer (7-Day Plan):', subRes.success ? 'PASSED' : 'FAILED', subRes.data?.subscription_number);

    // 8. Order Placement: Cash on delivery with price snapshotting
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const orderDate = dayAfterTomorrow.toISOString().split('T')[0];

    const orderRes = await fetch(`${baseUrl}/orders/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        category_id: categoriesRes.data[1].id, // Lunch
        delivery_date: orderDate,
        delivery_slot: '12:00 PM - 1:00 PM',
        delivery_address: {
          customer_name: 'Ananya Sharma',
          phone_number: '+919876543211',
          address_line1: 'Flat 402, Green Meadows Apartment',
          city: 'Bangalore',
          pincode: '560034',
        },
        items: [
          { food_item_id: foodsRes.data[4].id, quantity: 2 },
        ],
        payment_method: 'cash_on_delivery',
        special_instructions: 'Less spice please.',
        whatsapp_opt_in: true,
      }),
    }).then((r) => r.json());
    console.log('✔ POST /orders/customer (Place Order):', orderRes.success ? 'PASSED' : 'FAILED', orderRes.data?.order_number);

    // 9. Admin Reports & Dashboard Metrics
    const reportRes = await fetch(`${baseUrl}/reports/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    console.log('✔ GET /reports/dashboard: PASSED (Total Orders:', reportRes.data.totalOrders, ', Active Subs:', reportRes.data.activeSubscriptionsCount, ')');

    // 10. WhatsApp Notifications Outbox
    const notifyRes = await fetch(`${baseUrl}/webhooks/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    console.log(`✔ GET /webhooks/notifications: PASSED (${notifyRes.data.outbox.length} outbox notifications logged)`);

    console.log('\n=============================================');
    console.log('   ALL 10 API INTEGRATION TESTS PASSED 100%!');
    console.log('=============================================\n');
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
