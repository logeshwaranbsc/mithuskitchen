import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export const CartDrawer: React.FC = () => {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, subtotal, deliveryFee, total } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#E5EAE5]">
          {/* Header */}
          <div className="p-5 border-b border-[#E5EAE5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#237A45]" />
              <h2 className="text-lg font-bold text-[#202820]">Your Meal Cart</h2>
              <span className="text-xs font-semibold bg-[#EAF5EC] text-[#237A45] px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-[#6B756D] hover:bg-[#F7FAF7] hover:text-[#202820] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-[#EAF5EC] text-[#237A45] flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#202820]">Your cart is empty</h3>
                  <p className="text-xs text-[#6B756D] mt-1 max-w-xs">
                    Choose from our freshly cooked breakfast, lunch, or dinner menu to start.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/menu');
                  }}
                  className="btn-primary text-xs py-2.5 px-6"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                {/* Free delivery promo banner */}
                <div className="bg-[#EAF5EC] border border-[#237A45]/20 p-3 rounded-xl text-xs text-[#185C35]">
                  {subtotal >= 29900 ? (
                    <span className="font-semibold">🎉 You unlocked FREE Home Delivery!</span>
                  ) : (
                    <span>
                      Add <strong>{formatCurrency(29900 - subtotal)}</strong> more for <strong>FREE Delivery</strong>!
                    </span>
                  )}
                </div>

                <div className="divide-y divide-[#E5EAE5]">
                  {items.map(({ food, quantity }) => (
                    <div key={food.id} className="py-3.5 flex items-center justify-between gap-3">
                      <img
                        src={food.image_url}
                        alt={food.name}
                        className="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#202820] truncate">{food.name}</h4>
                        <p className="text-xs font-bold text-[#237A45] mt-0.5">
                          {formatCurrency(food.base_price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-[#F7FAF7] border border-[#E5EAE5] rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(food.id, quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white text-[#202820] flex items-center justify-center text-xs hover:bg-[#EAF5EC] hover:text-[#237A45] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(food.id, quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-white text-[#202820] flex items-center justify-center text-xs hover:bg-[#EAF5EC] hover:text-[#237A45] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(food.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sticky Cart Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E5EAE5] bg-[#F7FAF7] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6B756D]">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-[#202820]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6B756D]">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-[#202820]">
                    {deliveryFee === 0 ? <span className="text-[#237A45]">FREE</span> : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#202820] pt-2 border-t border-[#E5EAE5]">
                  <span>Total Amount</span>
                  <span className="text-base text-[#237A45]">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-[#6B756D]">
                Cash on Delivery • Safe & Hot Doorstep Delivery
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
