import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['kitchen-settings'],
    queryFn: async () => {
      const res: any = await api.get('/settings');
      return res.data;
    },
  });

  const [isOpen, setIsOpen] = useState(true);
  const [bannerMessage, setBannerMessage] = useState('Kitchen is operating normally. Fresh pre-orders open!');
  const [codEnabled, setCodEnabled] = useState(true);
  const [cosEnabled, setCosEnabled] = useState(true);

  React.useEffect(() => {
    if (settings.kitchen_status) {
      setIsOpen(settings.kitchen_status.is_open ?? true);
      setBannerMessage(settings.kitchen_status.banner_message || '');
    }
    if (settings.payments) {
      setCodEnabled(settings.payments.cash_on_delivery ?? true);
      setCosEnabled(settings.payments.cash_on_service ?? true);
    }
  }, [settings]);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      return await api.put('/settings/admin', { key, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-settings'] });
      setSuccessMsg('Kitchen operational settings saved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  const handleSaveAll = () => {
    updateSettingMutation.mutate({
      key: 'kitchen_status',
      value: { is_open: isOpen, banner_message: bannerMessage },
    });
    updateSettingMutation.mutate({
      key: 'payments',
      value: { cash_on_delivery: codEnabled, cash_on_service: cosEnabled, online_gateway_active: false },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">Kitchen Settings & Operations</h1>
        <p className="text-xs text-[#6B756D] mt-1">
          Control live ordering state, payment acceptance modes, and customer broadcast banners.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Kitchen Operation Card */}
      <div className="card-white p-6 rounded-3xl bg-white border border-[#E5EAE5] shadow-soft space-y-4">
        <h2 className="font-bold text-sm uppercase tracking-wider text-[#202820]">
          Kitchen Service Status
        </h2>

        <div className="space-y-4 text-xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isOpen}
              onChange={(e) => setIsOpen(e.target.checked)}
              className="accent-[#237A45] w-5 h-5 rounded-md"
            />
            <div>
              <span className="font-bold text-[#202820] text-sm block">Kitchen Open for Online Pre-Orders</span>
              <span className="text-[#6B756D]">When toggled off, customers will see a kitchen closed notice.</span>
            </div>
          </label>

          <div>
            <label className="block font-semibold mb-1 text-[#202820]">Customer Broadcast Notice</label>
            <input
              type="text"
              value={bannerMessage}
              onChange={(e) => setBannerMessage(e.target.value)}
              className="input-field text-xs"
            />
          </div>
        </div>
      </div>

      {/* Payments Policy Card */}
      <div className="card-white p-6 rounded-3xl bg-white border border-[#E5EAE5] shadow-soft space-y-4">
        <h2 className="font-bold text-sm uppercase tracking-wider text-[#202820]">
          Payment Acceptance Modes
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
              className="accent-[#237A45] w-4 h-4 rounded-md"
            />
            <div>
              <span className="font-bold text-[#202820] block">Cash on Delivery (COD)</span>
              <span className="text-[#6B756D]">Customer pays cash when driver delivers food</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cosEnabled}
              onChange={(e) => setCosEnabled(e.target.checked)}
              className="accent-[#237A45] w-4 h-4 rounded-md"
            />
            <div>
              <span className="font-bold text-[#202820] block">Cash on Service (COS)</span>
              <span className="text-[#6B756D]">For 7-day subscriptions and direct kitchen pick-ups</span>
            </div>
          </label>
        </div>

        <div className="p-3 bg-[#F7FAF7] rounded-xl border border-[#E5EAE5] text-[11px] text-[#6B756D]">
          <span className="font-bold text-[#202820] block">Note on Online Payment Gateways:</span>
          Online payments (Razorpay/UPI) are architecturally prepared in schema but intentionally disabled in this release as per system requirements.
        </div>
      </div>

      <button
        onClick={handleSaveAll}
        disabled={updateSettingMutation.isPending}
        className="btn-primary py-3 px-8 text-xs font-bold"
      >
        {updateSettingMutation.isPending ? 'Saving Settings...' : 'Save Kitchen Settings'}
      </button>
    </div>
  );
};
