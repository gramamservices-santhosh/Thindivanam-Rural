'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Star, ShoppingBag, IndianRupee } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, shopData, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading } = useOrders({ shopId: shopData?.shopId });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!user || !shopData) {
    return null;
  }

  // Calculate stats
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  const todayRevenue = deliveredOrders
    .filter((o) => {
      const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return orderDate >= todayStart;
    })
    .reduce((sum, o) => sum + o.total, 0);

  const weekRevenue = deliveredOrders
    .filter((o) => {
      const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
      return orderDate >= startOfWeek;
    })
    .reduce((sum, o) => sum + o.total, 0);

  const monthRevenue = deliveredOrders
    .filter((o) => {
      const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
      return orderDate >= startOfMonth;
    })
    .reduce((sum, o) => sum + o.total, 0);

  // Top selling products
  const productCounts: Record<string, { name: string; count: number }> = {};
  deliveredOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (productCounts[item.productName]) {
        productCounts[item.productName].count += item.quantity;
      } else {
        productCounts[item.productName] = { name: item.productName, count: item.quantity };
      }
    });
  });

  const topProducts = Object.values(productCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-shop px-4 pt-4 pb-6 rounded-b-[30px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-white text-xl font-bold flex-1">Analytics</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Revenue Summary */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Revenue Summary
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-lg font-bold text-green-600">₹{todayRevenue}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">This Week</p>
              <p className="text-lg font-bold text-blue-600">₹{weekRevenue}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">This Month</p>
              <p className="text-lg font-bold text-purple-600">₹{monthRevenue}</p>
            </div>
          </div>
        </div>

        {/* Order Stats */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingBag className="text-blue-600" size={20} />
            Order Statistics
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{deliveredOrders.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {orders.filter((o) => o.status === 'rejected').length}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Avg Order Value</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{deliveredOrders.length > 0 ? Math.round(monthRevenue / deliveredOrders.length) : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-orange-600" size={20} />
            Top Selling Products
          </h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{product.name}</span>
                  </div>
                  <span className="text-gray-500">{product.count} sold</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No sales data yet</p>
          )}
        </div>

        {/* Rating Summary */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="text-yellow-500" size={20} />
            Customer Ratings
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-800">
                {shopData.rating > 0 ? shopData.rating.toFixed(1) : 'N/A'}
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= Math.round(shopData.rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">{shopData.totalReviews} reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
