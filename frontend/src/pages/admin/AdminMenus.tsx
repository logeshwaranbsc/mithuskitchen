import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Check, X, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { MealCategory, FoodItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const AdminMenus: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<MealCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res: any = await api.get('/menus/categories');
      return res.data;
    },
  });

  const { data: foods = [] } = useQuery<FoodItem[]>({
    queryKey: ['foods'],
    queryFn: async () => {
      const res: any = await api.get('/foods');
      return res.data;
    },
  });

  // Toggle Category Mutation
  const toggleCategoryMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      return await api.put(`/menus/admin/categories/${id}`, { is_enabled: isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">Menu Management</h1>
        <p className="text-xs text-[#6B756D] mt-1">
          Manage Breakfast, Lunch, and Dinner categories and their active dish rosters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const categoryFoods = foods.filter((f) => f.category_id === cat.id);
          return (
            <div
              key={cat.id}
              className="card-white p-6 rounded-3xl bg-white border border-[#E5EAE5] shadow-soft space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#EAF5EC] text-[#237A45] flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-bold text-[#202820]">{cat.name}</h2>
                  </div>

                  <button
                    onClick={() =>
                      toggleCategoryMutation.mutate({ id: cat.id, isEnabled: !cat.is_enabled })
                    }
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      cat.is_enabled
                        ? 'bg-[#EAF5EC] text-[#237A45] border border-[#237A45]/30'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {cat.is_enabled ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <p className="text-xs text-[#6B756D] leading-relaxed">{cat.description}</p>

                <div className="p-3 bg-[#F7FAF7] border border-[#E5EAE5] rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#6B756D]">Default Delivery:</span>
                    <span className="font-bold text-[#202820]">{cat.default_delivery_time.slice(0, 5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B756D]">Advance Lead Time:</span>
                    <span className="font-bold text-[#237A45]">{cat.cutoff_hours} Hours</span>
                  </div>
                </div>

                {/* Items in this category */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#6B756D] uppercase tracking-wider block">
                    Assigned Dishes ({categoryFoods.length})
                  </span>
                  <div className="divide-y divide-[#E5EAE5] max-h-48 overflow-y-auto pr-1 text-xs">
                    {categoryFoods.map((f) => (
                      <div key={f.id} className="py-2 flex items-center justify-between">
                        <span className="font-medium text-[#202820] truncate max-w-[180px]">{f.name}</span>
                        <span className="font-bold text-[#237A45]">{formatCurrency(f.base_price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5EAE5] text-center">
                <span className="text-[11px] text-[#6B756D]">
                  {cat.is_enabled
                    ? 'Customers can place pre-orders for this meal.'
                    : 'Ordering is temporarily paused for this meal category.'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
