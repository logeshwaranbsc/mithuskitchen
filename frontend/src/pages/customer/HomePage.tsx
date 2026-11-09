import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Utensils, Calendar, Clock, ShieldCheck, ArrowRight, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { FoodItem, MealCategory, SubscriptionPlan } from '../../types';
import { FoodCard } from '../../components/FoodCard';
import { formatCurrency } from '../../utils/formatters';

export const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('breakfast');

  // Load Categories
  const { data: categories = [] } = useQuery<MealCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res: any = await api.get('/menus/categories');
      return res.data;
    },
  });

  // Load Foods
  const { data: foods = [], isLoading: foodsLoading } = useQuery<FoodItem[]>({
    queryKey: ['foods'],
    queryFn: async () => {
      const res: any = await api.get('/foods');
      return res.data;
    },
  });

  // Load Subscription Plans
  const { data: plans = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res: any = await api.get('/subscriptions/plans');
      return res.data;
    },
  });

  // Filter foods for current category
  const activeCategoryObj = categories.find((c) => c.code === selectedCategory);
  const filteredFoods = foods.filter((f) => f.category_id === activeCategoryObj?.id);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-[#E5EAE5] py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF5EC] border border-[#237A45]/20 text-[#237A45] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pure Home-Cooked Cloud Kitchen</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#202820] tracking-tight leading-[1.15]">
                Fresh Home Meals, <br className="hidden sm:inline" />
                Delivered Hot to <span className="text-[#237A45]">Your Door.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#6B756D] max-w-xl leading-relaxed">
                Experience traditional Indian comfort food prepared fresh for Breakfast, Lunch, and Dinner. Zero soda, zero artificial colors, and 100% goodness.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/menu" className="btn-primary px-6 py-3 text-sm">
                  <span>Browse Today's Menu</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link to="/subscriptions" className="btn-secondary px-6 py-3 text-sm">
                  <span>7-Day Subscription Plans</span>
                </Link>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E5EAE5]">
                <div className="flex items-center gap-2 text-xs text-[#202820] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#237A45] flex-shrink-0" />
                  <span>5-Hour Fresh Cutoff</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#202820] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#237A45] flex-shrink-0" />
                  <span>Pure Cow Ghee</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#202820] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#237A45] flex-shrink-0" />
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-soft-xl border border-[#E5EAE5] bg-white aspect-4/3 sm:aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=900&auto=format&fit=crop&q=80"
                  alt="Authentic South Indian Thali"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="bg-[#237A45] text-white text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Chef's Daily Special
                  </span>
                  <h3 className="text-lg font-bold mt-1">Authentic South Indian Thali</h3>
                  <p className="text-xs text-white/90">Rice, Drumstick Sambar, Pepper Rasam, Poriyal & Appalam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Available Meals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#237A45] uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" /> Fresh Daily Kitchen
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">
              Today's Available Meals
            </h2>
            <p className="text-sm text-[#6B756D] mt-1">
              Select your meal slot. Orders are prepared fresh after your booking.
            </p>
          </div>

          {/* Category Tabs: Breakfast, Lunch, Dinner */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#E5EAE5] shadow-soft w-fit">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.code)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedCategory === cat.code
                    ? 'bg-[#237A45] text-white shadow-sm'
                    : 'text-[#6B756D] hover:text-[#202820] hover:bg-[#F7FAF7]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Food Items Grid */}
        {foodsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card-white h-72 animate-pulse bg-gray-100 rounded-2xl"></div>
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="card-white p-10 text-center space-y-3">
            <Utensils className="w-10 h-10 text-[#237A45] mx-auto opacity-40" />
            <h3 className="text-base font-bold text-[#202820]">No dishes listed in this category today</h3>
            <p className="text-xs text-[#6B756D]">Please check our other meal times.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/menu" className="inline-flex items-center text-sm font-bold text-[#237A45] hover:underline">
            View full menu with custom filters <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </section>

      {/* Weekly Subscription Promotion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EAF5EC] border border-[#237A45]/20 rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="bg-[#237A45] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Weekly Subscriptions
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#185C35] leading-tight">
              Eat Healthy All Week Long with 7-Day Meal Plans
            </h2>
            <p className="text-sm sm:text-base text-[#202820]/80 leading-relaxed">
              Never worry about what to eat or cook. Subscribe to 7 days of Breakfast, Lunch, or Dinner with flexible pause policies and save up to 15%.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/subscriptions" className="btn-primary px-6 py-3 text-sm">
                <span>Explore 7-Day Plans</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose HOME KITCHEN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">
            The HOME KITCHEN Difference
          </h2>
          <p className="text-sm text-[#6B756D] mt-2">
            Why thousands of families and busy professionals trust us for their daily meals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-white p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] text-[#237A45] flex items-center justify-center font-bold">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#202820]">Zero Commercial Chemicals</h3>
            <p className="text-xs text-[#6B756D] leading-relaxed">
              We cook only with filtered water, wood-pressed groundnut & sesame oils, pure cow ghee, and authentic whole spices.
            </p>
          </div>

          <div className="card-white p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] text-[#237A45] flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#202820]">5-Hour Preparation Cutoff</h3>
            <p className="text-xs text-[#6B756D] leading-relaxed">
              We never cook bulk leftovers. Every batch is measured according to confirmed pre-orders 5 hours in advance.
            </p>
          </div>

          <div className="card-white p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] text-[#237A45] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#202820]">Price & Quantity Protection</h3>
            <p className="text-xs text-[#6B756D] leading-relaxed">
              Whenever you place an order, your price and portion are permanently locked and protected. Pay easily with Cash on Delivery.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
