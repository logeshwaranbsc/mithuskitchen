import React from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import { FoodItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface FoodCardProps {
  food: FoodItem;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.food.id === food.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="card-white overflow-hidden flex flex-col group hover:shadow-soft-lg transition-all border border-[#E5EAE5] bg-white rounded-2xl">
      {/* Image Container with Veg Badge */}
      <div className="relative h-48 w-full overflow-hidden bg-[#F7FAF7]">
        <img
          src={food.image_url}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Veg / Non-Veg Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg border border-[#E5EAE5] flex items-center justify-center shadow-sm">
          {food.is_veg ? (
            <div className="w-4 h-4 border-2 border-emerald-600 flex items-center justify-center p-0.5 rounded-xs" title="Vegetarian">
              <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
            </div>
          ) : (
            <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center p-0.5 rounded-xs" title="Non-Vegetarian">
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
            </div>
          )}
        </div>

        {/* Dietary Tag */}
        <div className="absolute top-3 right-3">
          {food.is_veg ? (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full shadow-xs">
              Veg
            </span>
          ) : (
            <span className="text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/80 px-2 py-0.5 rounded-full shadow-xs">
              Non-Veg
            </span>
          )}
        </div>

        {food.calories && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
            {food.calories} kcal
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-base text-[#202820] leading-snug group-hover:text-[#237A45] transition-colors">
              {food.name}
            </h3>
          </div>
          <p className="text-xs text-[#6B756D] line-clamp-2 leading-relaxed mb-3">
            {food.description}
          </p>
          {food.serving_size && (
            <span className="inline-block text-[11px] font-medium text-[#237A45] bg-[#EAF5EC] px-2 py-0.5 rounded-md mb-3">
              Portion: {food.serving_size}
            </span>
          )}
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-[#E5EAE5] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#6B756D] block leading-none">Price</span>
            <span className="text-lg font-extrabold text-[#237A45]">
              {formatCurrency(food.base_price)}
            </span>
          </div>

          <div>
            {!food.is_available ? (
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">
                Sold Out
              </span>
            ) : quantity === 0 ? (
              <button
                onClick={() => addItem(food, 1)}
                className="btn-primary text-xs py-2 px-4 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-[#EAF5EC] border border-[#237A45]/30 rounded-xl p-1">
                <button
                  onClick={() => updateQuantity(food.id, quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-white text-[#237A45] flex items-center justify-center font-bold hover:bg-[#237A45] hover:text-white transition-all shadow-sm"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-[#237A45] w-5 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(food.id, quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-[#237A45] text-white flex items-center justify-center font-bold hover:bg-[#185C35] transition-all shadow-sm"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
