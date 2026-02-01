'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/hooks/useCart';

interface CartItemProps {
  item: CartItemType;
}

const categoryIcons: Record<string, string> = {
  vegetables: '🥬',
  groceries: '🛒',
  dairy: '🥛',
  snacks: '🍪',
  other: '📦',
};

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleDecrease = () => {
    if (item.quantity === 1) {
      removeItem(item.productId);
    } else {
      updateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    updateQuantity(item.productId, item.quantity + 1);
  };

  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-3">
      {/* Product Icon */}
      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          '📦'
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-800 truncate">{item.productName}</h3>
        <p className="text-sm text-gray-500">
          ₹{item.price}/{item.unit}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrease}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
        </button>
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <button
          onClick={handleIncrease}
          className="w-8 h-8 rounded-full gradient-customer flex items-center justify-center text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Item Total */}
      <div className="text-right ml-2">
        <p className="font-semibold text-purple-600">₹{item.price * item.quantity}</p>
      </div>
    </div>
  );
}
