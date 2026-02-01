'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, IndianRupee, Clock, Star, Package, ClipboardList, BarChart3, Settings, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import StatCard, { StatCardSkeleton } from '@/components/StatCard';
import NewOrderAlert from '@/components/NewOrderAlert';
import { Order } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, shopData, loading: authLoading } = useAuth();
  const [newOrder, setNewOrder] = useState<Order | null>(null);
  const { orders, pendingCount, loading: ordersLoading } = useOrders({
    shopId: shopData?.shopId,
    onNewOrder: (order) => setNewOrder(order),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

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

  // Calculate today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((order) => {
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  const todayRevenue = todayOrders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  const isPending = shopData.status === 'pending';
  const isSuspended = shopData.status === 'suspended';

  return (
    <div className="min-h-screen pb-24">
      {/* New Order Alert */}
      {newOrder && (
        <NewOrderAlert order={newOrder} onDismiss={() => setNewOrder(null)} />
      )}

      {/* Header */}
      <div className="gradient-shop px-4 pt-6 pb-8 rounded-b-[30px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">Welcome back,</p>
            <h1 className="text-white text-xl font-bold">{shopData.shopName}</h1>
          </div>
          <img src="/logo.svg" alt="Nam Tindivanam" className="h-10" />
        </div>

        {/* Shop Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              shopData.isOpen ? 'bg-green-300 animate-pulse' : 'bg-red-300'
            }`}
          />
          <span className="text-white/90 text-sm">
            Shop is {shopData.isOpen ? 'Open' : 'Closed'}
          </span>
          {isPending && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs rounded-full font-medium">
              Pending Approval
            </span>
          )}
          {isSuspended && (
            <span className="ml-2 px-2 py-0.5 bg-red-400 text-white text-xs rounded-full font-medium">
              Suspended
            </span>
          )}
        </div>
      </div>

      {/* Status Alerts */}
      {isPending && (
        <div className="mx-4 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-yellow-800">Awaiting Approval</p>
              <p className="text-sm text-yellow-700 mt-1">
                Your shop is under review. Admin will activate it within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSuspended && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-red-800">Shop Suspended</p>
              <p className="text-sm text-red-700 mt-1">
                Your shop has been suspended. Please contact admin for more information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {ordersLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Today's Orders"
                value={todayOrders.length}
                icon={ShoppingBag}
                color="blue"
              />
              <StatCard
                title="Today's Revenue"
                value={`₹${todayRevenue}`}
                icon={IndianRupee}
                color="green"
              />
              <StatCard
                title="Pending Orders"
                value={pendingCount}
                icon={Clock}
                color={pendingCount > 0 ? 'red' : 'orange'}
                subtitle={pendingCount > 0 ? 'Needs attention!' : ''}
              />
              <StatCard
                title="Shop Rating"
                value={shopData.rating > 0 ? shopData.rating.toFixed(1) : 'N/A'}
                icon={Star}
                color="purple"
                subtitle={`${shopData.totalReviews} reviews`}
              />
            </>
          )}
        </div>
      </div>

      {/* Pending Orders Alert */}
      {pendingCount > 0 && (
        <Link
          href="/orders"
          className="mx-4 mb-4 p-4 bg-red-500 text-white rounded-xl flex items-center justify-between alert-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="font-bold">{pendingCount} New Order{pendingCount > 1 ? 's' : ''}</p>
              <p className="text-sm text-white/80">Tap to view and accept</p>
            </div>
          </div>
          <div className="text-2xl">→</div>
        </Link>
      )}

      {/* Quick Actions */}
      <div className="px-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/orders"
            className="bg-white rounded-xl p-4 card-shadow flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <ClipboardList className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Orders</p>
              <p className="text-sm text-gray-500">Manage orders</p>
            </div>
          </Link>

          <Link
            href="/products"
            className="bg-white rounded-xl p-4 card-shadow flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Package className="text-green-600" size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Products</p>
              <p className="text-sm text-gray-500">Manage items</p>
            </div>
          </Link>

          <Link
            href="/analytics"
            className="bg-white rounded-xl p-4 card-shadow flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Analytics</p>
              <p className="text-sm text-gray-500">View stats</p>
            </div>
          </Link>

          <Link
            href="/settings"
            className="bg-white rounded-xl p-4 card-shadow flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Settings className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Settings</p>
              <p className="text-sm text-gray-500">Shop settings</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          <Link href="/orders" className="text-green-600 font-medium text-sm">
            View All
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl p-4 card-shadow flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">#{order.orderId}</p>
                  <p className="text-sm text-gray-500">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{order.total}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : order.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-xl card-shadow">
            <ClipboardList size={40} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
