'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Store, User, Clock } from 'lucide-react';
import AdminOnly from '@/components/AdminOnly';
import { getAllOrders } from '@/lib/firestore/admin';
import { Order } from '@/types';

const statusTabs = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = (() => {
    switch (activeTab) {
      case 'pending':
        return orders.filter((o) => o.status === 'pending');
      case 'active':
        return orders.filter((o) => ['accepted', 'packed', 'out_for_delivery'].includes(o.status));
      case 'completed':
        return orders.filter((o) => ['delivered', 'rejected'].includes(o.status));
      default:
        return orders;
    }
  })();

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

  const getStatusColor = (status: Order['status']) => {
    const colors: Record<Order['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      packed: 'bg-indigo-100 text-indigo-700',
      out_for_delivery: 'bg-pink-100 text-pink-700',
      delivered: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <AdminOnly>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 pt-4 pb-6 rounded-b-[30px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-white text-xl font-bold flex-1">All Orders</h1>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
              {orders.length} orders
            </span>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="px-4 py-3 overflow-x-auto">
          <div className="flex gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="px-4 py-2 space-y-3">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 card-shadow animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.orderId} className="bg-white rounded-2xl p-4 card-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-800">#{order.orderId}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Store size={14} className="text-green-500" />
                    <span>{order.shopName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} className="text-blue-500" />
                    <span>{order.customerName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500">{order.items.length} items</span>
                  <span className="font-bold text-green-600">₹{order.total}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </AdminOnly>
  );
}
