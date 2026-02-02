'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Store, ShoppingBag, IndianRupee, Users, Percent } from 'lucide-react';
import AdminOnly from '@/components/AdminOnly';
import { getAllShops, getAllOrders, getAllCustomers } from '@/lib/firestore/admin';
import { Shop, Order, User } from '@/types';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [shopsData, ordersData, customersData] = await Promise.all([
          getAllShops(),
          getAllOrders(),
          getAllCustomers(),
        ]);
        setShops(shopsData);
        setOrders(ordersData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate stats
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCommission = deliveredOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const pendingCommission = deliveredOrders.filter((o) => !o.commissionPaid).reduce((sum, o) => sum + o.commissionAmount, 0);

  // Top shops by revenue
  const shopRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};
  deliveredOrders.forEach((order) => {
    if (!shopRevenue[order.shopId]) {
      shopRevenue[order.shopId] = { name: order.shopName, revenue: 0, orders: 0 };
    }
    shopRevenue[order.shopId].revenue += order.total;
    shopRevenue[order.shopId].orders += 1;
  });

  const topShops = Object.values(shopRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top products
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

  // Per-shop commission breakdown
  const shopCommissionData: Record<string, {
    name: string;
    phone: string;
    totalSales: number;
    totalOrders: number;
    commissionRate: number;
    commissionOwed: number;
    commissionPaid: number;
  }> = {};

  deliveredOrders.forEach((order) => {
    if (!shopCommissionData[order.shopId]) {
      const shop = shops.find(s => s.shopId === order.shopId);
      shopCommissionData[order.shopId] = {
        name: order.shopName,
        phone: shop?.phone || '',
        totalSales: 0,
        totalOrders: 0,
        commissionRate: shop?.commissionRate || 10,
        commissionOwed: 0,
        commissionPaid: 0,
      };
    }
    shopCommissionData[order.shopId].totalSales += order.total;
    shopCommissionData[order.shopId].totalOrders += 1;
    if (order.commissionPaid) {
      shopCommissionData[order.shopId].commissionPaid += order.commissionAmount;
    } else {
      shopCommissionData[order.shopId].commissionOwed += order.commissionAmount;
    }
  });

  const shopCommissionList = Object.entries(shopCommissionData)
    .map(([shopId, data]) => ({ shopId, ...data }))
    .sort((a, b) => b.totalSales - a.totalSales);

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
            <h1 className="text-white text-xl font-bold flex-1">Platform Analytics</h1>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 card-shadow animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-16 mb-1" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-4 card-shadow">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                    <IndianRupee className="text-green-600" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">₹{totalRevenue}</p>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>

                <div className="bg-white rounded-2xl p-4 card-shadow">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                    <Percent className="text-purple-600" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">₹{totalCommission}</p>
                  <p className="text-sm text-gray-500">Total Commission</p>
                </div>

                <div className="bg-white rounded-2xl p-4 card-shadow">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                    <IndianRupee className="text-orange-600" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">₹{pendingCommission}</p>
                  <p className="text-sm text-gray-500">Pending Collection</p>
                </div>

                <div className="bg-white rounded-2xl p-4 card-shadow">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                    <ShoppingBag className="text-blue-600" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>

                <div className="bg-white rounded-2xl p-4 card-shadow">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-2">
                    <Store className="text-indigo-600" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{shops.length}</p>
                  <p className="text-sm text-gray-500">Total Shops</p>
                </div>

                <div className="bg-white rounded-2xl p-4 card-shadow">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center mb-2">
                    <Users className="text-pink-600" size={20} />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{customers.length}</p>
                  <p className="text-sm text-gray-500">Total Customers</p>
                </div>
              </div>

              {/* Top Shops */}
              <div className="bg-white rounded-2xl p-4 card-shadow">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={20} />
                  Top Shops by Revenue
                </h2>
                {topShops.length > 0 ? (
                  <div className="space-y-3">
                    {topShops.map((shop, index) => (
                      <div key={shop.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-gray-700 font-medium">{shop.name}</p>
                            <p className="text-xs text-gray-500">{shop.orders} orders</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">₹{shop.revenue}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No data yet</p>
                )}
              </div>

              {/* Top Products */}
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
                  <p className="text-gray-500 text-center py-4">No data yet</p>
                )}
              </div>

              {/* Shop Commission Report */}
              <div className="bg-white rounded-2xl p-4 card-shadow">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Percent className="text-purple-600" size={20} />
                  Shop Commission Report
                </h2>
                {shopCommissionList.length > 0 ? (
                  <div className="space-y-4">
                    {shopCommissionList.map((shop) => (
                      <div key={shop.shopId} className="border border-gray-100 rounded-xl p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-800">{shop.name}</p>
                            <p className="text-xs text-gray-500">{shop.phone}</p>
                          </div>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            {shop.commissionRate}% rate
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-gray-500 text-xs">Total Sales</p>
                            <p className="font-bold text-gray-800">₹{shop.totalSales}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-gray-500 text-xs">Orders</p>
                            <p className="font-bold text-gray-800">{shop.totalOrders}</p>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-2">
                            <p className="text-orange-600 text-xs">Commission Owed</p>
                            <p className="font-bold text-orange-600">₹{shop.commissionOwed}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <p className="text-green-600 text-xs">Commission Paid</p>
                            <p className="font-bold text-green-600">₹{shop.commissionPaid}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No shop data yet</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminOnly>
  );
}
