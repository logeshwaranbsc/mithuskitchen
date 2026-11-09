import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, ShieldAlert, CheckCircle2, Save } from 'lucide-react';
import { api } from '../../services/api';
import { MealCategory } from '../../types';

export const AdminMealTimings: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<MealCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res: any = await api.get('/menus/categories');
      return res.data;
    },
  });

  const { data: settings = {} } = useQuery({
    queryKey: ['kitchen-settings'],
    queryFn: async () => {
      const res: any = await api.get('/settings');
      return res.data;
    },
  });

  const [timingsData, setTimingsData] = useState<Record<string, { time: string; cutoff: number }>>({});
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    if (categories.length > 0) {
      const initial: Record<string, { time: string; cutoff: number }> = {};
      categories.forEach((cat) => {
        initial[cat.id] = {
          time: cat.default_delivery_time.slice(0, 5),
          cutoff: cat.cutoff_hours,
        };
      });
      setTimingsData(initial);
    }
  }, [categories]);

  // Update Category Timing Mutation
  const updateTimingMutation = useMutation({
    mutationFn: async ({ id, time, cutoff }: { id: string; time: string; cutoff: number }) => {
      return await api.put(`/menus/admin/categories/${id}`, {
        default_delivery_time: `${time}:00`,
        cutoff_hours: cutoff,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSuccessMsg('Meal timings and cutoff rules updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  const handleSave = (catId: string) => {
    const data = timingsData[catId];
    if (data) {
      updateTimingMutation.mutate({
        id: catId,
        time: data.time,
        cutoff: data.cutoff,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">Meal Timings & Cutoff Rules</h1>
        <p className="text-xs text-[#6B756D] mt-1">
          Configure default delivery timings, 5-hour cutoff policies, and kitchen batch capacities.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Asian/Kolkata Timezone Banner */}
      <div className="bg-[#EAF5EC] border border-[#237A45]/30 rounded-2xl p-4 flex items-center justify-between text-xs text-[#185C35]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#237A45]" />
          <div>
            <span className="font-bold">Active Kitchen Timezone: Asia/Kolkata</span>
            <p className="text-[11px] text-[#202820]/70">
              Cutoffs are strictly validated in Indian Standard Time (IST).
            </p>
          </div>
        </div>
      </div>

      {/* Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const currentTiming = timingsData[cat.id] || {
            time: cat.default_delivery_time.slice(0, 5),
            cutoff: cat.cutoff_hours,
          };

          return (
            <div
              key={cat.id}
              className="card-white p-6 rounded-3xl bg-white border border-[#E5EAE5] shadow-soft space-y-5"
            >
              <div className="border-b border-[#E5EAE5] pb-3">
                <span className="text-[11px] font-bold text-[#237A45] bg-[#EAF5EC] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {cat.code}
                </span>
                <h3 className="text-lg font-bold text-[#202820] mt-1">{cat.name}</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#202820] mb-1">
                    Delivery Time (HH:mm)
                  </label>
                  <input
                    type="time"
                    value={currentTiming.time}
                    onChange={(e) =>
                      setTimingsData({
                        ...timingsData,
                        [cat.id]: { ...currentTiming, time: e.target.value },
                      })
                    }
                    className="input-field text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#202820] mb-1">
                    Advance Cutoff (Hours prior to delivery)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={currentTiming.cutoff}
                    onChange={(e) =>
                      setTimingsData({
                        ...timingsData,
                        [cat.id]: { ...currentTiming, cutoff: parseInt(e.target.value) || 5 },
                      })
                    }
                    className="input-field text-xs font-semibold"
                  />
                  <p className="text-[11px] text-[#6B756D] mt-1">
                    Orders close {currentTiming.cutoff} hours before delivery time.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSave(cat.id)}
                disabled={updateTimingMutation.isPending}
                className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Timings</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
