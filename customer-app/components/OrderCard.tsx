'use client';

import { Store, ChevronRight } from 'lucide-react';
import { Order } from '@/types';
import { getStatusText, getStatusColor } from '@/lib/firestore/orders';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
  const statusText = getStatusText(order.status);
  const statusColor = getStatusColor(order.status);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 card-shadow ${onClick ? 'cursor-pointer card-shadow-hover' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-gray-800">#{order.orderId}</p>
          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {statusText}
        </span>
      </div>

      {/* Shop Info */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
          <Store size={16} className="text-white" />
        </div>
        <span className="font-medium text-gray-700">{order.shopName}</span>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items.slice(0, 3).map((item, index) => (
          <p key={index} className="text-sm text-gray-600">
            {item.quantity}x {item.productName}
          </p>
        ))}
        {order.items.length > 3 && (
          <p className="text-sm text-gray-400">
            +{order.items.length - 3} more items
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-sm text-gray-500">Total (COD)</p>
          <p className="font-bold text-lg text-purple-600">₹{order.total}</p>
        </div>
        {onClick && (
          <ChevronRight size={24} className="text-gray-400" />
        )}
      </div>

      {/* Rejection Reason */}
      {order.status === 'rejected' && order.rejectionReason && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600">
            <span className="font-medium">Reason:</span> {order.rejectionReason}
          </p>
        </div>
      )}
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 card-shadow animate-pulse">
      <div className="flex justify-between mb-3">
        <div>
          <div className="h-5 bg-gray-200 rounded w-24 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="space-y-1 mb-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="flex justify-between pt-3 border-t border-gray-100">
        <div>
          <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
          <div className="h-5 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}
