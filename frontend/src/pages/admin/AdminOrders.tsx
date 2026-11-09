import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Search, Filter, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status Change Dialog State
  const [newStatus, setNewStatus] = useState<string>('confirmed');
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [statusNote, setStatusNote] = useState('');

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['admin-orders', statusFilter, search],
    queryFn: async () => {
      let url = '/orders/admin';
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const res: any = await api.get(url);
      return res.data;
    },
    refetchInterval: 15000,
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrder) return;
      return await api.patch(`/orders/admin/${selectedOrder.id}/status`, {
        status: newStatus,
        payment_status: paymentStatus,
        note: statusNote,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      setSelectedOrder(null);
      setStatusNote('');
    },
  });

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.order_status);
    setPaymentStatus(order.payment_status);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">Order Management</h1>
          <p className="text-xs text-[#6B756D] mt-1">
            Track customer deliveries, update meal preparation pipeline, and confirm cash settlements.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5EAE5] shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, name, or phone..."
            className="input-field pl-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#237A45] text-white shadow-xs'
                  : 'bg-[#F7FAF7] text-[#6B756D] hover:text-[#202820]'
              }`}
            >
              {st.replace(/_/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-white rounded-3xl bg-white border border-[#E5EAE5] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7FAF7] text-[#6B756D] font-bold border-b border-[#E5EAE5]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer & Phone</th>
                <th className="py-3 px-4">Dishes & Quantity</th>
                <th className="py-3 px-4">Delivery Window</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE5]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6B756D]">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7FAF7] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#202820]">
                      #{order.order_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#202820]">{order.address_snapshot?.customer_name}</div>
                      <div className="text-[11px] text-[#6B756D]">{order.address_snapshot?.phone_number}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="max-w-xs space-y-0.5">
                        {(order.items || []).map((i) => (
                          <div key={i.id} className="truncate text-[11px] text-[#202820]">
                            {i.food_name} <strong>x {i.quantity}</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{formatDate(order.delivery_date)}</div>
                      <div className="text-[11px] text-[#237A45] font-semibold">{order.delivery_slot}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#237A45]">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.payment_status} type="payment" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.order_status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(order)}
                        className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Manage & Status Changer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E5EAE5] space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center border-b border-[#E5EAE5] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#202820]">
                  Order #{selectedOrder.order_number}
                </h3>
                <span className="text-[#6B756D]">Placed {formatDate(selectedOrder.created_at?.split('T')[0] || '')}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="bg-[#F7FAF7] p-3.5 rounded-2xl border border-[#E5EAE5] space-y-1">
              <span className="font-bold text-[#202820] block">Customer Delivery Details:</span>
              <p className="text-[#202820]">
                {selectedOrder.address_snapshot?.customer_name} ({selectedOrder.address_snapshot?.phone_number})
              </p>
              <p className="text-[#6B756D]">
                {selectedOrder.address_snapshot?.address_line1}, {selectedOrder.address_snapshot?.city} - {selectedOrder.address_snapshot?.pincode}
              </p>
              {selectedOrder.special_instructions && (
                <p className="text-[#237A45] font-semibold pt-1">
                  Note: "{selectedOrder.special_instructions}"
                </p>
              )}
            </div>

            {/* Dishes Breakdown */}
            <div className="space-y-1.5">
              <span className="font-bold text-[#202820] block">Ordered Items (Price Protected):</span>
              <div className="divide-y divide-[#E5EAE5] border border-[#E5EAE5] rounded-xl p-3 bg-white">
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} className="py-1.5 flex justify-between">
                    <span>
                      {item.food_name} <strong>x {item.quantity}</strong>
                    </span>
                    <span className="font-bold">{formatCurrency(item.total_price)}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-extrabold text-sm text-[#237A45]">
                  <span>Total Amount Payable:</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Status Change Form */}
            <div className="space-y-3 pt-2 border-t border-[#E5EAE5]">
              <span className="font-bold text-[#202820] block uppercase tracking-wider">
                Update Order Status (Auto-sends WhatsApp alert)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Order Pipeline Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing in Kitchen</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="collected">Collected (Cash)</option>
                    <option value="refunded">Refunded</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Status Audit Note (Optional)</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Delivered by Delivery Partner Rajesh"
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => updateStatusMutation.mutate()}
                disabled={updateStatusMutation.isPending}
                className="btn-primary flex-1 py-2.5 text-xs font-bold"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Save & Dispatch Updates'}
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-outline px-4 py-2.5 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
