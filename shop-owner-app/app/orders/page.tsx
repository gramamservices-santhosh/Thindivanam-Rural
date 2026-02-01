'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/components/Toast';
import OrderCard from '@/components/OrderCard';
import NewOrderAlert from '@/components/NewOrderAlert';
import { Order, OrderStatus } from '@/types';

const statusTabs = [
  { id: 'pending', label: 'New', color: 'orange' },
  { id: 'accepted', label: 'Accepted', color: 'blue' },
  { id: 'packed', label: 'Packed', color: 'indigo' },
  { id: 'out_for_delivery', label: 'Delivery', color: 'pink' },
  { id: 'completed', label: 'Completed', color: 'green' },
];

export default function OrdersPage() {
  const router = useRouter();
  const { user, shopData, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [newOrder, setNewOrder] = useState<Order | null>(null);

  const {
    orders,
    loading,
    updateOrderStatus,
    pendingOrders,
    acceptedOrders,
    packedOrders,
    outForDeliveryOrders,
    completedOrders,
    pendingCount,
  } = useOrders({
    shopId: shopData?.shopId,
    onNewOrder: (order) => setNewOrder(order),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, additionalData?: any) => {
    try {
      await updateOrderStatus(orderId, newStatus, additionalData);

      const statusMessages: Record<OrderStatus, string> = {
        pending: 'Order updated',
        accepted: 'Order accepted!',
        packed: 'Order marked as packed!',
        out_for_delivery: 'Order out for delivery!',
        delivered: 'Order delivered successfully!',
        rejected: 'Order rejected',
      };

      showToast(statusMessages[newStatus], newStatus === 'rejected' ? 'warning' : 'success');
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Failed to update order', 'error');
    }
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'pending':
        return pendingOrders;
      case 'accepted':
        return acceptedOrders;
      case 'packed':
        return packedOrders;
      case 'out_for_delivery':
        return outForDeliveryOrders;
      case 'completed':
        return completedOrders;
      default:
        return orders;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!user || !shopData) {
    return null;
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="min-h-screen pb-24">
      {/* New Order Alert */}
      {newOrder && (
        <NewOrderAlert order={newOrder} onDismiss={() => setNewOrder(null)} />
      )}

      {/* Header */}
      <div className="gradient-shop px-4 pt-4 pb-6 rounded-b-[30px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-white text-xl font-bold flex-1">Orders</h1>
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              {pendingCount} New
            </span>
          )}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {statusTabs.map((tab) => {
            const count =
              tab.id === 'pending'
                ? pendingOrders.length
                : tab.id === 'accepted'
                ? acceptedOrders.length
                : tab.id === 'packed'
                ? packedOrders.length
                : tab.id === 'out_for_delivery'
                ? outForDeliveryOrders.length
                : completedOrders.length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'gradient-shop text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium text-sm">{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 py-2">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 card-shadow animate-pulse">
                <div className="flex justify-between mb-3">
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-24 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20" />
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <ClipboardList size={48} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No {activeTab === 'completed' ? 'completed' : activeTab} orders
            </h2>
            <p className="text-gray-500">
              {activeTab === 'pending'
                ? 'New orders will appear here'
                : 'Orders will move here when updated'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
