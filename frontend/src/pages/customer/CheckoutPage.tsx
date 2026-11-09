import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ShoppingBag, ArrowLeft, CheckCircle2, AlertCircle, Clock, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MealCategory, MealSlot, DeliveryArea } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Pick tomorrow by default or today if lead time allows
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [deliveryDate, setDeliveryDate] = useState<string>(tomorrowStr);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>('lunch');
  const [selectedSlot, setSelectedSlot] = useState<string>('12:00 PM - 1:00 PM');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'cash_on_service'>('cash_on_delivery');
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);

  // Delivery Address Form
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [pincode, setPincode] = useState('560034');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Load Categories
  const { data: categories = [] } = useQuery<MealCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res: any = await api.get('/menus/categories');
      return res.data;
    },
  });

  // Load Meal Slots
  const currentCategory = categories.find((c) => c.code === selectedCategoryCode);
  const { data: slots = [] } = useQuery<MealSlot[]>({
    queryKey: ['meal-slots', currentCategory?.id],
    queryFn: async () => {
      if (!currentCategory) return [];
      const res: any = await api.get(`/menus/slots?category_id=${currentCategory.id}`);
      return res.data;
    },
    enabled: Boolean(currentCategory),
  });

  // Load Serviceable Areas
  const { data: deliveryAreas = [] } = useQuery<DeliveryArea[]>({
    queryKey: ['delivery-areas'],
    queryFn: async () => {
      const res: any = await api.get('/settings/delivery-areas');
      return res.data;
    },
  });

  // Order Placement Mutation
  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!currentCategory) throw new Error('Please select a valid meal category');
      return await api.post('/orders/customer', {
        category_id: currentCategory.id,
        delivery_date: deliveryDate,
        delivery_slot: selectedSlot,
        delivery_address: {
          customer_name: customerName,
          phone_number: phoneNumber,
          address_line1: addressLine1,
          city,
          pincode,
        },
        items: items.map((i) => ({
          food_item_id: i.food.id,
          quantity: i.quantity,
        })),
        payment_method: paymentMethod,
        special_instructions: specialInstructions,
        whatsapp_opt_in: whatsappOptIn,
      });
    },
    onSuccess: (res: any) => {
      setConfirmedOrder(res.data);
      clearCart();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Order could not be confirmed.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Add food items before checkout.');
      return;
    }

    if (!customerName || !phoneNumber || !addressLine1 || !pincode) {
      setErrorMessage('Please fill in all delivery details.');
      return;
    }

    // Check pincode serviceability
    const isServiceable = deliveryAreas.some((a) => a.pincode === pincode && a.is_serviceable);
    if (!isServiceable && deliveryAreas.length > 0) {
      setErrorMessage(`Sorry, we do not deliver to pincode ${pincode} yet. Please check serviceable areas.`);
      return;
    }

    orderMutation.mutate();
  };

  // Order Confirmed Success Screen
  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#EAF5EC] text-[#237A45] flex items-center justify-center mx-auto shadow-soft">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#237A45] bg-[#EAF5EC] px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed
          </span>
          <h1 className="text-3xl font-extrabold text-[#202820]">
            Thank you for ordering, {customerName}!
          </h1>
          <p className="text-sm text-[#6B756D]">
            Order <span className="font-bold text-[#202820]">#{confirmedOrder.order_number}</span> has been received by our kitchen.
          </p>
        </div>

        <div className="card-white p-6 rounded-2xl text-left text-xs space-y-3 bg-white">
          <div className="flex justify-between border-b border-[#E5EAE5] pb-2">
            <span className="text-[#6B756D]">Scheduled Delivery:</span>
            <span className="font-bold text-[#202820]">
              {confirmedOrder.delivery_date} ({confirmedOrder.delivery_slot})
            </span>
          </div>
          <div className="flex justify-between border-b border-[#E5EAE5] pb-2">
            <span className="text-[#6B756D]">Address:</span>
            <span className="font-bold text-[#202820] text-right">
              {confirmedOrder.address_snapshot?.address_line1}, {confirmedOrder.address_snapshot?.pincode}
            </span>
          </div>
          <div className="flex justify-between border-b border-[#E5EAE5] pb-2">
            <span className="text-[#6B756D]">Payment Mode:</span>
            <span className="font-bold text-[#237A45] uppercase">
              {confirmedOrder.payment_method?.replace(/_/g, ' ')} ({confirmedOrder.payment_status})
            </span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-extrabold">
            <span>Total Payable:</span>
            <span className="text-[#237A45]">{formatCurrency(confirmedOrder.total_amount)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link to="/orders" className="btn-primary py-3 px-6 text-xs">
            Track Order Status
          </Link>
          <Link to="/menu" className="btn-outline py-3 px-6 text-xs">
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <Link to="/menu" className="inline-flex items-center text-xs font-semibold text-[#6B756D] hover:text-[#237A45]">
        <ArrowLeft className="w-4 h-4 mr-1" /> Return to Menu
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Checkout Form */}
        <div className="lg:col-span-7 bg-white border border-[#E5EAE5] rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#202820]">Checkout & Delivery Details</h1>
            <p className="text-xs text-[#6B756D] mt-1">
              Select your meal category slot and enter delivery destination.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Meal Category & Schedule */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#202820] uppercase tracking-wider block">
                1. Delivery Schedule & Slot
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryCode(cat.code)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedCategoryCode === cat.code
                        ? 'border-[#237A45] bg-[#EAF5EC] text-[#185C35] font-bold'
                        : 'border-[#E5EAE5] bg-[#F7FAF7] text-[#6B756D]'
                    }`}
                  >
                    <div className="text-xs font-bold">{cat.name}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">Delivered ~{cat.default_delivery_time.slice(0, 5)}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#202820] mb-1">Delivery Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="input-field text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202820] mb-1">Delivery Window</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="input-field text-xs"
                  >
                    {slots.length > 0 ? (
                      slots.map((s) => (
                        <option key={s.id} value={s.display_label}>
                          {s.display_label}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="12:00 PM - 1:00 PM">12:00 PM - 1:00 PM</option>
                        <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                        <option value="7:30 AM - 8:30 AM">7:30 AM - 8:30 AM</option>
                        <option value="7:30 PM - 8:30 PM">7:30 PM - 8:30 PM</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-3 pt-3 border-t border-[#E5EAE5]">
              <label className="text-xs font-bold text-[#202820] uppercase tracking-wider block">
                2. Contact & Delivery Address
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#202820] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Recipient's name"
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202820] mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="input-field text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#202820] mb-1">Street Address / House No.</label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Flat, building, street, area"
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202820] mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202820] mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560034"
                    className="input-field text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#202820] mb-1">Special Cooking Notes (Optional)</label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Mild spice, less oil, ring doorbell"
                    className="input-field text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-3 border-t border-[#E5EAE5]">
              <label className="text-xs font-bold text-[#202820] uppercase tracking-wider block">
                3. Payment Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-[#237A45] bg-[#EAF5EC] text-[#185C35]'
                    : 'border-[#E5EAE5] bg-[#F7FAF7]'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="accent-[#237A45]"
                    />
                    <span className="text-xs font-bold">Cash on Delivery</span>
                  </div>
                  <span className="text-[10px] text-[#237A45] font-semibold">Verified Safe</span>
                </label>

                <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_service'
                    ? 'border-[#237A45] bg-[#EAF5EC] text-[#185C35]'
                    : 'border-[#E5EAE5] bg-[#F7FAF7]'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'cash_on_service'}
                      onChange={() => setPaymentMethod('cash_on_service')}
                      className="accent-[#237A45]"
                    />
                    <span className="text-xs font-bold">Cash on Service</span>
                  </div>
                  <span className="text-[10px] text-[#237A45] font-semibold">Kitchen Pickup</span>
                </label>
              </div>

              {/* WhatsApp Opt-in */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="whatsapp_opt"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  className="rounded text-[#237A45] focus:ring-[#237A45] accent-[#237A45] w-4 h-4"
                />
                <label htmlFor="whatsapp_opt" className="text-xs text-[#202820]">
                  Send instant WhatsApp live updates for order confirmation & delivery
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={orderMutation.isPending || items.length === 0}
              className="btn-primary w-full py-3.5 text-sm font-bold shadow-sm"
            >
              {orderMutation.isPending ? 'Placing Order...' : `Confirm & Place Order (${formatCurrency(total)})`}
            </button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 bg-white border border-[#E5EAE5] rounded-3xl p-6 shadow-soft space-y-5 sticky top-24">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5EAE5]">
            <ShoppingBag className="w-5 h-5 text-[#237A45]" />
            <h3 className="font-extrabold text-base text-[#202820]">Order Summary</h3>
          </div>

          <div className="divide-y divide-[#E5EAE5] max-h-72 overflow-y-auto pr-1">
            {items.map(({ food, quantity }) => (
              <div key={food.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#202820]">{food.name}</span>
                  <span className="text-[#6B756D] block">Qty: {quantity} x {formatCurrency(food.base_price)}</span>
                </div>
                <span className="font-extrabold text-[#237A45]">
                  {formatCurrency(food.base_price * quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E5EAE5] space-y-2 text-xs">
            <div className="flex justify-between text-[#6B756D]">
              <span>Items Subtotal</span>
              <span className="font-bold text-[#202820]">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#6B756D]">
              <span>Delivery Fee</span>
              <span className="font-bold text-[#202820]">
                {deliveryFee === 0 ? <span className="text-[#237A45]">FREE</span> : formatCurrency(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[#202820] pt-2 border-t border-[#E5EAE5]">
              <span>Final Total</span>
              <span className="text-[#237A45]">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="bg-[#F7FAF7] p-3 rounded-xl border border-[#E5EAE5] text-[11px] text-[#6B756D] space-y-1">
            <p className="flex items-center gap-1 font-semibold text-[#202820]">
              <ShieldCheck className="w-4 h-4 text-[#237A45]" /> Price Snapshot Protected
            </p>
            <p>Your confirmed order amount is locked and immune to future menu price adjustments.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
