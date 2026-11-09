import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Search, Pause, Play, XCircle, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { Subscription } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminSubscriptions: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: subscriptions = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const res: any = await api.get('/subscriptions/admin');
      return res.data;
    },
  });

  const updateSubMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await api.patch(`/subscriptions/admin/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
    },
  });

  const filtered = subscriptions.filter((s: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.subscription_number.toLowerCase().includes(q) ||
      s.customer_name?.toLowerCase().includes(q) ||
      s.customer_phone?.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">Subscription Management</h1>
        <p className="text-xs text-[#6B756D] mt-1">
          Monitor 7-day automated meal plans, remaining days, and pause/resume requests.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E5EAE5] shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, customer or phone..."
            className="input-field pl-10 text-xs"
          />
        </div>
      </div>

      <div className="card-white rounded-3xl bg-white border border-[#E5EAE5] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7FAF7] text-[#6B756D] font-bold border-b border-[#E5EAE5]">
              <tr>
                <th className="py-3 px-4">Sub ID & Plan</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Plan Window</th>
                <th className="py-3 px-4">Remaining Days</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE5]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#6B756D]">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                filtered.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-[#F7FAF7] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#202820] block">#{sub.subscription_number}</span>
                      <span className="text-[11px] text-[#237A45] font-semibold">{sub.plan_name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#202820] block">{sub.customer_name}</span>
                      <span className="text-[11px] text-[#6B756D]">{sub.customer_phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span>{formatDate(sub.start_date)}</span> to <span>{formatDate(sub.end_date)}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-[#237A45] text-sm">{sub.remaining_days ?? 7}</span> / 7 Days
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#202820]">
                      {formatCurrency(sub.total_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {sub.status === 'active' && (
                        <button
                          onClick={() => updateSubMutation.mutate({ id: sub.id, status: 'paused' })}
                          className="btn-outline text-[11px] py-1 px-2.5 text-amber-700 hover:bg-amber-50"
                          title="Pause Subscription"
                        >
                          <Pause className="w-3 h-3 inline mr-1" /> Pause
                        </button>
                      )}
                      {sub.status === 'paused' && (
                        <button
                          onClick={() => updateSubMutation.mutate({ id: sub.id, status: 'active' })}
                          className="btn-primary text-[11px] py-1 px-2.5"
                          title="Resume Subscription"
                        >
                          <Play className="w-3 h-3 inline mr-1" /> Resume
                        </button>
                      )}
                      {sub.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            if (confirm(`Cancel subscription #${sub.subscription_number}?`)) {
                              updateSubMutation.mutate({ id: sub.id, status: 'cancelled' });
                            }
                          }}
                          className="p-1 rounded-lg text-red-600 hover:bg-red-50 border border-[#E5EAE5]"
                          title="Cancel Subscription"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
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
