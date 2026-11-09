import { inMemoryStore } from '../repositories/in-memory-store';

export class ReportService {
  /**
   * Get overall Dashboard Metrics & Revenue
   */
  async getDashboardMetrics() {
    const todayStr = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const orders = inMemoryStore.orders;
    const subscriptions = inMemoryStore.subscriptions;

    const totalOrders = orders.length;
    const todayOrders = orders.filter((o) => o.created_at.startsWith(todayStr));
    const pendingOrders = orders.filter((o) => o.order_status === 'confirmed' || o.order_status === 'preparing');
    const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
    const totalCustomers = inMemoryStore.profiles.filter((p) => p.role === 'customer').length;

    // Order revenues
    const todayOrderRevenue = todayOrders
      .filter((o) => o.order_status !== 'cancelled')
      .reduce((acc, o) => acc + o.total_amount, 0);

    const weeklyOrderRevenue = orders
      .filter((o) => o.created_at >= sevenDaysAgo && o.order_status !== 'cancelled')
      .reduce((acc, o) => acc + o.total_amount, 0);

    const monthlyOrderRevenue = orders
      .filter((o) => o.created_at >= thirtyDaysAgo && o.order_status !== 'cancelled')
      .reduce((acc, o) => acc + o.total_amount, 0);

    // Subscription revenues
    const subRevenue = subscriptions
      .filter((s) => s.status !== 'cancelled')
      .reduce((acc, s) => acc + s.total_amount, 0);

    return {
      totalOrders,
      todayOrdersCount: todayOrders.length,
      pendingOrdersCount: pendingOrders.length,
      activeSubscriptionsCount: activeSubscriptions.length,
      totalCustomers,
      todayRevenue: todayOrderRevenue,
      weeklyRevenue: weeklyOrderRevenue,
      monthlyRevenue: monthlyOrderRevenue,
      totalSubscriptionRevenue: subRevenue,
      recentOrders: orders.slice(0, 8),
    };
  }

  /**
   * Daily sales breakdown
   */
  async getDailySalesReport(startDate?: string, endDate?: string) {
    const orders = inMemoryStore.orders.filter((o) => o.order_status !== 'cancelled');
    const dateMap = new Map<string, { date: string; ordersCount: number; revenue: number }>();

    orders.forEach((o) => {
      const dateKey = o.delivery_date;
      if (startDate && dateKey < startDate) return;
      if (endDate && dateKey > endDate) return;

      const curr = dateMap.get(dateKey) || { date: dateKey, ordersCount: 0, revenue: 0 };
      curr.ordersCount += 1;
      curr.revenue += o.total_amount;
      dateMap.set(dateKey, curr);
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Food-wise sales breakdown
   */
  async getFoodWiseSales() {
    const itemMap = new Map<string, { food_name: string; total_quantity: number; total_revenue: number }>();

    for (const item of inMemoryStore.order_items) {
      const curr = itemMap.get(item.food_name) || { food_name: item.food_name, total_quantity: 0, total_revenue: 0 };
      curr.total_quantity += item.quantity;
      curr.total_revenue += item.total_price;
      itemMap.set(item.food_name, curr);
    }

    return Array.from(itemMap.values()).sort((a, b) => b.total_revenue - a.total_revenue);
  }

  /**
   * Generate CSV report for orders
   */
  async generateOrdersCsv(startDate?: string, endDate?: string): Promise<string> {
    const orders = inMemoryStore.orders.filter((o) => {
      if (startDate && o.delivery_date < startDate) return false;
      if (endDate && o.delivery_date > endDate) return false;
      return true;
    });

    const headers = [
      'Order ID',
      'Delivery Date',
      'Slot',
      'Customer Name',
      'Mobile Number',
      'Address',
      'Total Amount (INR)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Created At',
    ];

    const rows = orders.map((o) => [
      `"${o.order_number}"`,
      `"${o.delivery_date}"`,
      `"${o.delivery_slot}"`,
      `"${o.address_snapshot?.customer_name || ''}"`,
      `"${o.address_snapshot?.phone_number || ''}"`,
      `"${(o.address_snapshot?.address_line1 || '').replace(/"/g, '""')}"`,
      (o.total_amount / 100).toFixed(2),
      `"${o.payment_method}"`,
      `"${o.payment_status}"`,
      `"${o.order_status}"`,
      `"${o.created_at}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const reportService = new ReportService();
