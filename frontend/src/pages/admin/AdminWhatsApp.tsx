import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, CheckCircle2, Clock, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../utils/formatters';

export const AdminWhatsApp: React.FC = () => {
  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const res: any = await api.get('/webhooks/notifications');
      return res.data;
    },
    refetchInterval: 10000,
  });

  const outbox = notificationsData?.outbox || [];
  const logs = notificationsData?.logs || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">WhatsApp Cloud API Notifications</h1>
          <p className="text-xs text-[#6B756D] mt-1">
            Asynchronous notification outbox logs, automated retries, and customer delivery confirmations.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Outbox
        </button>
      </div>

      {/* Cloud API Integration Status Pill */}
      <div className="bg-[#EAF5EC] border border-[#237A45]/30 rounded-2xl p-4 flex items-center justify-between text-xs text-[#185C35]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#237A45]" />
          <div>
            <span className="font-bold">Official Meta WhatsApp Cloud API Architecture:</span> Active Outbox Pattern with automatic retry and duplicate prevention.
          </div>
        </div>
        <span className="bg-white/80 font-bold px-2.5 py-1 rounded-md text-[11px] text-[#237A45]">
          Worker Active (15s Poll)
        </span>
      </div>

      {/* Outbox Table */}
      <div className="card-white rounded-3xl bg-white border border-[#E5EAE5] shadow-soft overflow-hidden space-y-4 p-6">
        <h2 className="font-extrabold text-base text-[#202820]">Notification Outbox Pipeline ({outbox.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7FAF7] text-[#6B756D] font-bold border-b border-[#E5EAE5]">
              <tr>
                <th className="py-2.5 px-3">Recipient Phone</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Event Trigger</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Retries</th>
                <th className="py-2.5 px-3">Message Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE5]">
              {outbox.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#6B756D]">
                    No outbox notifications queued.
                  </td>
                </tr>
              ) : (
                outbox.map((item: any) => (
                  <tr key={item.id} className="hover:bg-[#F7FAF7]">
                    <td className="py-3 px-3 font-semibold text-[#202820]">{item.recipient_phone}</td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-[#6B756D]">{item.recipient_type}</td>
                    <td className="py-3 px-3 font-medium text-[#237A45]">{item.event_type}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'sent'
                          ? 'bg-[#EAF5EC] text-[#237A45]'
                          : item.status === 'processing'
                          ? 'bg-blue-50 text-blue-700'
                          : item.status === 'failed'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#6B756D]">{item.retry_count} / {item.max_retries}</td>
                    <td className="py-3 px-3 text-[#6B756D] max-w-xs truncate text-[11px]">
                      {item.template_params?.textFallback || item.template_name}
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
