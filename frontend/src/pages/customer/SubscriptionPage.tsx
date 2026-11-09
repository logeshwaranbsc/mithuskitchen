import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Check, ArrowRight, ShieldCheck, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { SubscriptionPlan } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const SubscriptionPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Default start date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minStartDateStr = tomorrow.toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(minStartDateStr);

  // Address fields
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [pincode, setPincode] = useState('560034');
  const [specialNotes, setSpecialNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load Plans
  const { data: plans = [], isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res: any = await api.get('/subscriptions/plans');
      return res.data;
    },
  });

  // Automatically select first plan if none selected
  React.useEffect(() => {
    if (plans.length > 0 && !selectedPlan) {
      setSelectedPlan(plans[0]);
    }
  }, [plans, selectedPlan]);

  // Compute 7-day preview schedule
  const getSevenDaySchedule = () => {
    if (!startDate || !selectedPlan) return [];
    const schedule = [];
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      schedule.push({
        dayNumber: i + 1,
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        meals: selectedPlan.meal_categories_included.map((m) => m.toUpperCase()),
      });
    }
    return schedule;
  };

  const schedule = getSevenDaySchedule();

  // Create Subscription Mutation
  const subMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlan) throw new Error('Please select a plan');
      return await api.post('/subscriptions/customer', {
        plan_id: selectedPlan.id,
        start_date: startDate,
        delivery_address: {
          customer_name: customerName,
          phone_number: phoneNumber,
          address_line1: addressLine1,
          city,
          pincode,
        },
        payment_method: 'cash_on_service',
        special_notes: specialNotes,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['customer-subscriptions'] });
      setSuccessMsg(`Subscription Activated! Ref: ${data.data?.subscription_number}`);
      setTimeout(() => {
        navigate('/my-subscriptions');
      }, 1500);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to activate subscription');
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthenticated) {
      navigate('/login?redirect=/subscriptions');
      return;
    }

    if (!customerName || !phoneNumber || !addressLine1 || !pincode) {
      setErrorMsg('Please complete all delivery address fields');
      return;
    }

    subMutation.mutate();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF5EC] text-[#237A45] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>7-Day Meal Subscriptions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#202820] tracking-tight">
          Nutritious Home Cooking, Guaranteed Daily
        </h1>
        <p className="text-sm text-[#6B756D]">
          Choose the meal combination that fits your routine. Pause or resume dates whenever you travel.
        </p>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`cursor-pointer card-white p-6 rounded-2xl flex flex-col justify-between transition-all relative border-2 ${
                isSelected
                  ? 'border-[#237A45] shadow-soft-lg bg-white ring-2 ring-[#237A45]/20'
                  : 'border-[#E5EAE5] hover:border-[#237A45]/50 bg-white'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#237A45] text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="space-y-3">
                <span className="text-[11px] font-bold text-[#237A45] bg-[#EAF5EC] px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">
                  {plan.duration_days} Calendar Days
                </span>
                <h3 className="font-extrabold text-lg text-[#202820]">{plan.name}</h3>
                <p className="text-xs text-[#6B756D] leading-relaxed">{plan.description}</p>

                {/* Included Meals Badges */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {plan.meal_categories_included.map((cat) => (
                    <span
                      key={cat}
                      className="text-[11px] font-bold bg-[#F7FAF7] border border-[#E5EAE5] px-2 py-0.5 rounded-md text-[#202820]"
                    >
                      {cat.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Savings */}
              <div className="pt-6 mt-6 border-t border-[#E5EAE5] flex items-end justify-between">
                <div>
                  <span className="text-xs text-[#6B756D] block">Total for 7 Days</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-[#237A45]">
                      {formatCurrency(plan.price)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#185C35] bg-[#EAF5EC] px-2 py-1 rounded-md">
                    {plan.discount_percentage}% OFF
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-Day Schedule Preview & Booking Form */}
      {selectedPlan && (
        <div className="bg-white border border-[#E5EAE5] rounded-3xl p-6 sm:p-8 shadow-soft space-y-8">
          <div className="border-b border-[#E5EAE5] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#202820]">
                Configure Your {selectedPlan.name}
              </h2>
              <p className="text-xs text-[#6B756D] mt-0.5">
                Review your 7-day schedule and confirm delivery address.
              </p>
            </div>
            {/* Start Date Selector */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[#202820] whitespace-nowrap">
                Start Date:
              </label>
              <input
                type="date"
                min={minStartDateStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field text-xs py-2 w-44"
              />
            </div>
          </div>

          {/* 7-Day Visual Calendar Strip */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#202820] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#237A45]" /> 7-Day Meal Delivery Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {schedule.map((slot) => (
                <div
                  key={slot.dayNumber}
                  className="bg-[#F7FAF7] border border-[#E5EAE5] rounded-xl p-3 text-center space-y-1.5"
                >
                  <span className="text-[11px] font-bold text-[#237A45]">Day {slot.dayNumber}</span>
                  <div className="font-extrabold text-xs text-[#202820]">{slot.dayName}</div>
                  <div className="text-[10px] text-[#6B756D]">{formatDate(slot.dateStr)}</div>
                  <div className="pt-1.5 border-t border-[#E5EAE5] flex flex-col gap-1">
                    {slot.meals.map((m) => (
                      <span key={m} className="text-[9px] font-bold bg-[#EAF5EC] text-[#185C35] rounded-sm py-0.5">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Address & Booking */}
          <form onSubmit={handleSubscribe} className="space-y-6 pt-4 border-t border-[#E5EAE5]">
            <h4 className="text-xs font-bold text-[#202820] uppercase tracking-wider">
              Delivery Address & Contact
            </h4>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#202820] mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202820] mb-1">Mobile Number (for WhatsApp Updates)</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#202820] mb-1">Flat / House No., Apartment & Street</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Flat 402, Green Meadows Apartment, 14th Cross"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202820] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202820] mb-1">Pincode (Serviceable)</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="560034"
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#202820] mb-1">Special Dietary Instructions</label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Mild spice, less oil, ring bell twice"
                  className="input-field"
                />
              </div>
            </div>

            {/* Payment Mode (Cash on Service) */}
            <div className="p-4 rounded-2xl bg-[#F7FAF7] border border-[#E5EAE5] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#202820]">Payment Method:</span>
                  <p className="text-xs text-[#6B756D]">Cash on Service (Pay at kitchen or on first delivery)</p>
                </div>
                <span className="text-xs font-extrabold text-[#237A45] bg-[#EAF5EC] px-3 py-1 rounded-lg">
                  {formatCurrency(selectedPlan.price)} Total
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={subMutation.isPending}
              className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{subMutation.isPending ? 'Activating Subscription...' : 'Confirm 7-Day Subscription'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
