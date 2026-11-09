import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CalendarCheck,
  Users,
  DollarSign,
  ArrowUpRight,
  UtensilsCrossed,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardMetrics, Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ['admin-dashboard-metrics'],
    queryFn: async () => {
      const res: any = await api.get('/reports/dashboard');
      return res.data;
    },
    refetchInterval: 15000, // auto-refresh dashboard
  });

  // Quick Order Status Change Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await api.patch(`/orders/admin/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
    },
  });

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-28 bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Orders', value: metrics.totalOrders, icon: ShoppingBag, color: 'text-[#237A45]', bg: 'bg-[#EAF5EC]' },
    { label: "Today's Orders", value: metrics.todayOrdersCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pending Orders', value: metrics.pendingOrdersCount, icon: UtensilsCrossed, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active 7-Day Subs', value: metrics.activeSubscriptionsCount, icon: CalendarCheck, color: 'text-[#185C35]', bg: 'bg-[#EAF5EC]' },
    { label: 'Total Customers', value: metrics.totalCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: "Today's Revenue", value: formatCurrency(metrics.todayRevenue), icon: TrendingUp, color: 'text-[#237A45]', bg: 'bg-[#EAF5EC]' },
    { label: 'Weekly Revenue', value: formatCurrency(metrics.weeklyRevenue), icon: DollarSign, color: 'text-[#237A45]', bg: 'bg-[#EAF5EC]' },
    { label: 'Monthly Revenue', value: formatCurrency(metrics.monthlyRevenue), icon: DollarSign, color: 'text-[#237A45]', bg: 'bg-[#EAF5EC]' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">Kitchen Command Center</h1>
        <p className="text-xs text-[#6B756D] mt-1">
          Real-time metrics, live cooking queues, and order status pipeline.
        </p>
      </div>

      {/* 8 Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="card-white p-5 rounded-2xl bg-white border border-[#E5EAE5] flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-[#6B756D] block">{card.label}</span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#202820] mt-1 block">
                  {card.value}
                </span>
              </div>
              <div className={`w-11 h-11 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders & Quick Controls */}
      <div className="card-white rounded-3xl bg-white border border-[#E5EAE5] shadow-soft overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#E5EAE5] flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#202820]">Recent Orders & Live Pipeline</h2>
            <p className="text-xs text-[#6B756D]">Update status instantly to trigger automated WhatsApp customer notifications.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7FAF7] text-[#6B756D] font-bold border-b border-[#E5EAE5]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Delivery Schedule</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Pipeline Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE5]">
              {metrics.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B756D]">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7FAF7] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#202820]">
                      #{order.order_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#202820]">{order.address_snapshot?.customer_name}</div>
                      <div className="text-[11px] text-[#6B756D]">{order.address_snapshot?.phone_number}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{formatDate(order.delivery_date)}</div>
                      <div className="text-[11px] text-[#237A45] font-semibold">{order.delivery_slot}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#202820]">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.order_status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {order.order_status === 'confirmed' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'preparing' })}
                          className="btn-secondary text-[11px] py-1.5 px-3"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.order_status === 'preparing' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'out_for_delivery' })}
                          className="btn-primary text-[11px] py-1.5 px-3"
                        >
                          Dispatch Delivery
                        </button>
                      )}
                      {order.order_status === 'out_for_delivery' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'delivered' })}
                          className="btn-primary text-[11px] py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {order.order_status === 'delivered' && (
                        <span className="text-[11px] text-[#237A45] font-bold">✔ Delivered</span>
                      )}
                      {order.order_status === 'cancelled' && (
                        <span className="text-[11px] text-red-600 font-bold">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
