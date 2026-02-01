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
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!shopData) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <ShoppingBag className="text-emerald-600" size={32} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Loading Shop Data...</h2>
        <p className="text-slate-500 text-sm text-center">If this takes too long, your shop data may not exist yet.</p>
        <button
          onClick={() => router.push('/login')}
          className="btn-primary mt-4"
        >
          Back to Login
        </button>
      </div>
    );
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
      <div className="gradient-shop px-5 pt-6 pb-10 rounded-b-[32px]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/70 text-sm font-medium">Welcome back,</p>
            <h1 className="text-white text-xl font-bold tracking-tight">{shopData.shopName}</h1>
          </div>
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <span className="text-xl">🏪</span>
          </div>
        </div>

        {/* Shop Status */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${shopData.isOpen ? 'bg-white/20' : 'bg-white/10'}`}>
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                shopData.isOpen ? 'bg-green-300 animate-pulse' : 'bg-red-300'
              }`}
            />
            <span className="text-white font-medium text-sm">
              {shopData.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          {isPending && (
            <span className="px-3 py-1.5 bg-amber-400 text-amber-900 text-xs rounded-xl font-semibold">
              Pending Approval
            </span>
          )}
          {isSuspended && (
            <span className="px-3 py-1.5 bg-red-400 text-white text-xs rounded-xl font-semibold">
              Suspended
            </span>
          )}
        </div>
      </div>

      {/* Status Alerts */}
      {isPending && (
        <div className="mx-5 mt-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="font-semibold text-amber-800">Awaiting Approval</p>
              <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                Your shop is under review. Admin will activate it within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSuspended && (
        <div className="mx-5 mt-5 p-4 bg-red-50 border border-red-200 rounded-2xl animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="font-semibold text-red-800">Shop Suspended</p>
              <p className="text-sm text-red-700 mt-1 leading-relaxed">
                Your shop has been suspended. Please contact admin for more information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="px-5 py-5">
        <div className="grid grid-cols-2 gap-4">
          {ordersLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <div className="contents animate-fade-in">
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
            </div>
          )}
        </div>
      </div>

      {/* Pending Orders Alert */}
      {pendingCount > 0 && (
        <Link
          href="/orders"
          className="mx-5 mb-5 p-5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl flex items-center justify-between alert-pulse shadow-lg shadow-red-500/25"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="font-bold text-lg">{pendingCount} New Order{pendingCount > 1 ? 's' : ''}</p>
              <p className="text-sm text-white/80 font-medium">Tap to view and accept</p>
            </div>
          </div>
          <div className="text-2xl font-bold">→</div>
        </Link>
      )}

      {/* Quick Actions */}
      <div className="px-5">
        <h2 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/orders"
            className="bg-white rounded-2xl p-4 card-shadow card-hover flex items-center gap-3 border border-slate-100"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <ClipboardList className="text-blue-600" size={22} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Orders</p>
              <p className="text-sm text-slate-500">Manage orders</p>
            </div>
          </Link>

          <Link
            href="/products"
            className="bg-white rounded-2xl p-4 card-shadow card-hover flex items-center gap-3 border border-slate-100"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Package className="text-emerald-600" size={22} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Products</p>
              <p className="text-sm text-slate-500">Manage items</p>
            </div>
          </Link>

          <Link
            href="/analytics"
            className="bg-white rounded-2xl p-4 card-shadow card-hover flex items-center gap-3 border border-slate-100"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
              <BarChart3 className="text-violet-600" size={22} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Analytics</p>
              <p className="text-sm text-slate-500">View stats</p>
            </div>
          </Link>

          <Link
            href="/settings"
            className="bg-white rounded-2xl p-4 card-shadow card-hover flex items-center gap-3 border border-slate-100"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Settings className="text-amber-600" size={22} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Settings</p>
              <p className="text-sm text-slate-500">Shop settings</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Orders</h2>
          <Link href="/orders" className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors">
            View All →
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-3 animate-fade-in">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl p-4 card-shadow flex items-center justify-between border border-slate-100"
              >
                <div>
                  <p className="font-bold text-slate-800">#{order.orderId}</p>
                  <p className="text-sm text-slate-500 font-medium">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600 text-lg">₹{order.total}</p>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${
                      order.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-700'
                        : order.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
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
          <div className="text-center py-12 bg-white rounded-2xl card-shadow border border-slate-100">
            <ClipboardList size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
