'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardList, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import OrderCard, { OrderCardSkeleton } from '@/components/OrderCard';
import { getCustomerOrders } from '@/lib/firestore/orders';
import { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const fetchOrders = async (isRefresh = false) => {
    if (!user) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await getCustomerOrders(user.uid);
      setOrders(result);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-customer px-4 pt-4 pb-6 rounded-b-[30px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-white text-xl font-bold flex-1">My Orders</h1>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white ${
              refreshing ? 'animate-spin' : ''
            }`}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <ClipboardList size={48} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-6">
              Your orders will appear here
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
