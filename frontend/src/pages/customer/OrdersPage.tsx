import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Clock, MapPin, CheckCircle2, ChevronRight, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const OrdersPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['customer-orders'],
    queryFn: async () => {
      const res: any = await api.get('/orders/customer');
      return res.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-[#237A45] mx-auto opacity-50" />
        <h2 className="text-xl font-bold text-[#202820]">Please login to view your orders</h2>
        <p className="text-xs text-[#6B756D]">Track your daily warm meals and delivery timings.</p>
        <Link to="/login?redirect=/orders" className="btn-primary text-xs py-2.5 px-6">
          Login with Mobile OTP
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">My Meal Orders</h1>
          <p className="text-xs text-[#6B756D] mt-1">
            Real-time status tracking for your confirmed pre-orders.
          </p>
        </div>
        <Link to="/menu" className="btn-primary text-xs py-2.5 px-4 self-start">
          Order Another Meal
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="card-white h-40 animate-pulse bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card-white p-12 text-center space-y-3">
          <PackageCheck className="w-12 h-12 text-[#237A45] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[#202820]">No orders placed yet</h3>
          <p className="text-xs text-[#6B756D]">
            Explore today's freshly prepared dishes and get warm food delivered.
          </p>
          <div className="pt-2">
            <Link to="/menu" className="btn-primary text-xs py-2.5 px-6">
              Browse Menu
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusSteps = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
            const currentStepIdx = statusSteps.indexOf(order.order_status);

            return (
              <div key={order.id} className="card-white p-5 sm:p-6 rounded-2xl space-y-5 bg-white border border-[#E5EAE5]">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5EAE5] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-[#202820]">
                        #{order.order_number}
                      </span>
                      <StatusBadge status={order.order_status} />
                    </div>
                    <div className="text-xs text-[#6B756D] flex items-center gap-3">
                      <span>Booked: {formatDate(order.created_at?.split('T')[0] || '')}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#237A45] font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Slot: {order.delivery_slot} on {formatDate(order.delivery_date)}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-[#6B756D] block">Payable ({order.payment_method?.replace(/_/g, ' ').toUpperCase()})</span>
                    <span className="text-lg font-extrabold text-[#237A45]">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Progress Tracker (if not cancelled) */}
                {order.order_status !== 'cancelled' && (
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {statusSteps.map((step, idx) => {
                        const isDone = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;
                        return (
                          <div key={step} className="flex flex-col items-center gap-1.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                isDone
                                  ? 'bg-[#237A45] text-white shadow-xs'
                                  : 'bg-gray-100 text-gray-400 border border-gray-200'
                              } ${isCurrent ? 'ring-4 ring-[#EAF5EC]' : ''}`}
                            >
                              {idx + 1}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-semibold ${isDone ? 'text-[#202820]' : 'text-[#6B756D]'}`}>
                              {step === 'out_for_delivery' ? 'Out for Delivery' : step.charAt(0).toUpperCase() + step.slice(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E5EAE5] text-xs">
                  <div>
                    <h4 className="font-bold text-[#202820] mb-2">Dishes Ordered:</h4>
                    <div className="space-y-1.5 text-[#6B756D]">
                      {(order.items || []).map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>
                            {item.food_name} <strong className="text-[#202820]">x {item.quantity}</strong>
                          </span>
                          <span className="font-semibold text-[#202820]">
                            {formatCurrency(item.total_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-[#E5EAE5] md:pl-4">
                    <h4 className="font-bold text-[#202820] mb-2 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#237A45]" /> Delivery Address:
                    </h4>
                    <p className="text-[#6B756D]">
                      {order.address_snapshot?.customer_name} ({order.address_snapshot?.phone_number})
                    </p>
                    <p className="text-[#6B756D] mt-0.5">
                      {order.address_snapshot?.address_line1}, {order.address_snapshot?.city} - {order.address_snapshot?.pincode}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
