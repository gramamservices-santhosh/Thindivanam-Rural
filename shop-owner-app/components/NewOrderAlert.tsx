'use client';

import Link from 'next/link';
import { Bell, ArrowRight } from 'lucide-react';
import { Order } from '@/types';

interface NewOrderAlertProps {
  order: Order;
  onDismiss: () => void;
}

export default function NewOrderAlert({ order, onDismiss }: NewOrderAlertProps) {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto">
      <div className="bg-red-500 text-white rounded-2xl p-4 shadow-xl alert-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
            <Bell size={24} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg">NEW ORDER!</p>
            <p className="text-white/90 text-sm">
              #{order.orderId} from {order.customerName}
            </p>
            <p className="text-white/80 text-sm font-semibold">
              Amount: ₹{order.total}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Link
            href="/orders"
            onClick={onDismiss}
            className="flex-1 bg-white text-red-500 py-2 rounded-xl font-semibold text-center flex items-center justify-center gap-2"
          >
            View Order
            <ArrowRight size={18} />
          </Link>
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-xl bg-white/20 font-medium"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
