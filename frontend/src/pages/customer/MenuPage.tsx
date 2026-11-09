import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { FoodItem, MealCategory } from '../../types';
import { FoodCard } from '../../components/FoodCard';

export const MenuPage: React.FC = () => {
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Categories
  const { data: categories = [] } = useQuery<MealCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res: any = await api.get('/menus/categories');
      return res.data;
    },
  });

  // Foods
  const { data: foods = [], isLoading } = useQuery<FoodItem[]>({
    queryKey: ['foods'],
    queryFn: async () => {
      const res: any = await api.get('/foods');
      return res.data;
    },
  });

  const activeCategory = categories.find((c) => c.code === selectedCategoryCode);

  // Filter foods
  const filteredFoods = foods.filter((f) => {
    if (activeCategory && f.category_id !== activeCategory.id) return false;
    if (dietaryFilter === 'veg' && !f.is_veg) return false;
    if (dietaryFilter === 'non-veg' && f.is_veg) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#202820] tracking-tight">
          Daily Kitchen Menu
        </h1>
        <p className="text-sm text-[#6B756D]">
          Authentic, freshly cooked South & North Indian homestyle dishes. Order in advance to secure your hot meal.
        </p>
      </div>

      {/* Meal Category Switcher Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-white border border-[#E5EAE5] shadow-soft">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryCode(cat.code)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategoryCode === cat.code
                  ? 'bg-[#237A45] text-white shadow-sm'
                  : 'text-[#6B756D] hover:text-[#202820]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cutoff & Delivery Time Notice Banner */}
      {activeCategory && (
        <div className="bg-[#EAF5EC] border border-[#237A45]/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#185C35]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#237A45] flex-shrink-0" />
            <div>
              <span className="font-bold">{activeCategory.name} Delivery Time:</span>{' '}
              {activeCategory.default_delivery_time.slice(0, 5)} (Asia/Kolkata)
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium bg-white/70 px-3 py-1.5 rounded-lg border border-[#237A45]/15">
            <AlertCircle className="w-3.5 h-3.5 text-[#237A45]" />
            <span>Order at least {activeCategory.cutoff_hours} hours in advance for fresh preparation</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5EAE5] shadow-soft">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish name or ingredient..."
            className="input-field pl-10 text-xs"
          />
        </div>

        {/* Dietary Filter (All / Veg / Non-Veg) */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
          <button
            onClick={() => setDietaryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              dietaryFilter === 'all'
                ? 'bg-[#202820] border-[#202820] text-white shadow-xs'
                : 'bg-white border-[#E5EAE5] text-[#6B756D] hover:bg-gray-50'
            }`}
          >
            All Dishes
          </button>

          <button
            onClick={() => setDietaryFilter('veg')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              dietaryFilter === 'veg'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                : 'bg-white border-[#E5EAE5] text-[#6B756D] hover:bg-gray-50'
            }`}
          >
            <div className="w-3 h-3 border border-emerald-600 rounded-xs flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
            </div>
            <span>Pure Veg</span>
          </button>

          <button
            onClick={() => setDietaryFilter('non-veg')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              dietaryFilter === 'non-veg'
                ? 'bg-red-50 border-red-500 text-red-800 shadow-xs'
                : 'bg-white border-[#E5EAE5] text-[#6B756D] hover:bg-gray-50'
            }`}
          >
            <div className="w-3 h-3 border border-red-600 rounded-xs flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
            </div>
            <span>Non-Veg Meals</span>
          </button>
        </div>
      </div>

      {/* Foods Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card-white h-72 animate-pulse bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="card-white p-12 text-center space-y-3">
          <p className="text-base font-bold text-[#202820]">No dishes matched your search</p>
          <p className="text-xs text-[#6B756D]">Try clearing your search query or selecting another meal time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFoods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};
