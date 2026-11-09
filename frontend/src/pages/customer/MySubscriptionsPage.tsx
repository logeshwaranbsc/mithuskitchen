import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, CheckCircle2, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Subscription } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const MySubscriptionsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const { data: subscriptions = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ['customer-subscriptions'],
    queryFn: async () => {
      const res: any = await api.get('/subscriptions/customer');
      return res.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <Calendar className="w-12 h-12 text-[#237A45] mx-auto opacity-50" />
        <h2 className="text-xl font-bold text-[#202820]">Please login to view subscriptions</h2>
        <Link to="/login?redirect=/my-subscriptions" className="btn-primary text-xs py-2.5 px-6">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">My 7-Day Subscriptions</h1>
          <p className="text-xs text-[#6B756D] mt-1">
            Manage your daily automated meal schedules, pause upcoming days, or renew.
          </p>
        </div>
        <Link to="/subscriptions" className="btn-primary text-xs py-2.5 px-4 self-start">
          Add New Subscription
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1].map((n) => (
            <div key={n} className="card-white h-48 animate-pulse bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="card-white p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-[#237A45] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[#202820]">No active subscriptions</h3>
          <p className="text-xs text-[#6B756D]">
            Subscribe to our 7-day breakfast, lunch, or dinner plans and save up to 15%.
          </p>
          <div className="pt-2">
            <Link to="/subscriptions" className="btn-primary text-xs py-2.5 px-6">
              View 7-Day Plans
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="card-white p-6 rounded-2xl bg-white border border-[#E5EAE5] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5EAE5] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-[#202820]">{sub.plan_name}</span>
                    <StatusBadge status={sub.status} />
                  </div>
                  <span className="text-xs text-[#6B756D]">
                    ID: #{sub.subscription_number} • Period: {formatDate(sub.start_date)} to {formatDate(sub.end_date)}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#6B756D] block">Total Amount</span>
                  <span className="text-lg font-extrabold text-[#237A45]">
                    {formatCurrency(sub.total_amount)}
                  </span>
                </div>
              </div>

              {/* Remaining days & Delivery breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#F7FAF7] p-3 rounded-xl border border-[#E5EAE5]">
                  <span className="text-[#6B756D] block">Remaining Days</span>
                  <span className="text-base font-extrabold text-[#237A45]">{sub.remaining_days ?? 7} Days</span>
                </div>
                <div className="bg-[#F7FAF7] p-3 rounded-xl border border-[#E5EAE5]">
                  <span className="text-[#6B756D] block">Payment Method</span>
                  <span className="font-bold text-[#202820] uppercase">{sub.payment_method.replace(/_/g, ' ')}</span>
                </div>
                <div className="bg-[#F7FAF7] p-3 rounded-xl border border-[#E5EAE5]">
                  <span className="text-[#6B756D] block">Payment Status</span>
                  <span className="font-bold text-[#237A45] uppercase">{sub.payment_status}</span>
                </div>
                <div className="bg-[#F7FAF7] p-3 rounded-xl border border-[#E5EAE5]">
                  <span className="text-[#6B756D] block">Destination</span>
                  <span className="font-bold text-[#202820] truncate block">{sub.address_snapshot?.city} ({sub.address_snapshot?.pincode})</span>
                </div>
              </div>

              {/* Scheduled Meals List */}
              {sub.scheduled_meals && sub.scheduled_meals.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-[#202820] uppercase tracking-wider">
                    Scheduled Meals Calendar
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {sub.scheduled_meals.map((meal) => (
                      <div key={meal.id} className="bg-[#F7FAF7] border border-[#E5EAE5] p-2.5 rounded-xl text-center text-xs space-y-1">
                        <div className="font-bold text-[11px] text-[#202820]">{formatDate(meal.meal_date)}</div>
                        <StatusBadge status={meal.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
