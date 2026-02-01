'use client';

import { useState } from 'react';
import { User, Phone, MapPin, Clock, Check, X, Package, Truck, CheckCircle } from 'lucide-react';
import { Order, OrderStatus } from '@/types';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus, additionalData?: any) => void;
}

const statusConfig: Record<OrderStatus, { label: string; class: string }> = {
  pending: { label: 'New Order', class: 'badge-pending' },
  accepted: { label: 'Accepted', class: 'badge-accepted' },
  packed: { label: 'Packed', class: 'badge-packed' },
  out_for_delivery: { label: 'Out for Delivery', class: 'badge-delivery' },
  delivered: { label: 'Delivered', class: 'badge-delivered' },
  rejected: { label: 'Rejected', class: 'badge-rejected' },
};

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      switch (action) {
        case 'accept':
          await onUpdateStatus(order.orderId, 'accepted');
          break;
        case 'pack':
          await onUpdateStatus(order.orderId, 'packed');
          break;
        case 'out_for_delivery':
          await onUpdateStatus(order.orderId, 'out_for_delivery');
          break;
        case 'deliver':
          await onUpdateStatus(order.orderId, 'delivered');
          break;
        case 'reject':
          await onUpdateStatus(order.orderId, 'rejected', { rejectionReason: rejectReason });
          setShowRejectModal(false);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const status = statusConfig[order.status];

  return (
    <>
      <div className={`bg-white rounded-2xl p-4 card-shadow ${order.status === 'pending' ? 'border-2 border-orange-300' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-gray-800">#{order.orderId}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={12} />
              {formatTime(order.createdAt)}
            </p>
          </div>
          <span className={`badge ${status.class}`}>{status.label}</span>
        </div>

        {/* Customer Info */}
        <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <User size={14} className="text-gray-400" />
            <span className="text-gray-700">{order.customerName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone size={14} className="text-gray-400" />
            <a href={`tel:${order.customerPhone}`} className="text-green-600 font-medium">
              {order.customerPhone}
            </a>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600">{order.deliveryAddress}</span>
          </div>
        </div>

        {/* Items */}
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Order Items:</p>
          <div className="space-y-1">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.productName}
                </span>
                <span className="text-gray-800 font-medium">₹{item.subtotal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-3 border-t border-gray-100">
          <span className="text-gray-600">Total (COD)</span>
          <span className="text-xl font-bold text-green-600">₹{order.total}</span>
        </div>

        {/* Actions based on status */}
        <div className="flex gap-2 mt-3">
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => handleAction('accept')}
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Accept
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className="flex-1 btn-danger flex items-center justify-center gap-2"
              >
                <X size={18} />
                Reject
              </button>
            </>
          )}

          {order.status === 'accepted' && (
            <button
              onClick={() => handleAction('pack')}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Package size={18} />
              Mark as Packed
            </button>
          )}

          {order.status === 'packed' && (
            <button
              onClick={() => handleAction('out_for_delivery')}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Truck size={18} />
              Out for Delivery
            </button>
          )}

          {order.status === 'out_for_delivery' && (
            <button
              onClick={() => handleAction('deliver')}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Mark Delivered
            </button>
          )}
        </div>

        {/* Rejection reason */}
        {order.status === 'rejected' && order.rejectionReason && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">
              <span className="font-medium">Reason:</span> {order.rejectionReason}
            </p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Reject Order</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this order:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Out of stock, Shop closed..."
              rows={3}
              className="input-field resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={!rejectReason.trim() || loading}
                className="flex-1 btn-danger disabled:opacity-50"
              >
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
