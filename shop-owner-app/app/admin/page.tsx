'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Store, Users, ShoppingBag, BarChart3, IndianRupee, Clock, Check, X } from 'lucide-react';
import AdminOnly from '@/components/AdminOnly';
import { useToast } from '@/components/Toast';
import { getPlatformStats, getShopsByStatus, approveShop, suspendShop } from '@/lib/firestore/admin';
import { PlatformStats, Shop } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [pendingShops, setPendingShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, shopsData] = await Promise.all([
        getPlatformStats(),
        getShopsByStatus('pending'),
      ]);
      setStats(statsData);
      setPendingShops(shopsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (shopId: string) => {
    try {
      await approveShop(shopId);
      showToast('Shop approved!', 'success');
      fetchData();
    } catch (error) {
      showToast('Failed to approve shop', 'error');
    }
  };

  const handleReject = async (shopId: string) => {
    try {
      await suspendShop(shopId);
      showToast('Shop rejected', 'warning');
      fetchData();
    } catch (error) {
      showToast('Failed to reject shop', 'error');
    }
  };

  return (
    <AdminOnly>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 pt-4 pb-6 rounded-b-[30px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-white text-xl font-bold flex-1">Admin Dashboard</h1>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Platform Stats */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 card-shadow animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-16 mb-1" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 card-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                  <ShoppingBag className="text-blue-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalOrdersToday}</p>
                <p className="text-sm text-gray-500">Orders Today</p>
              </div>

              <div className="bg-white rounded-2xl p-4 card-shadow">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                  <IndianRupee className="text-green-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-800">₹{stats.totalRevenueToday}</p>
                <p className="text-sm text-gray-500">Revenue Today</p>
              </div>

              <div className="bg-white rounded-2xl p-4 card-shadow">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                  <Store className="text-purple-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.activeShops}</p>
                <p className="text-sm text-gray-500">Active Shops</p>
              </div>

              <div className="bg-white rounded-2xl p-4 card-shadow">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                  <Users className="text-orange-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</p>
                <p className="text-sm text-gray-500">Total Customers</p>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/shops"
              className="bg-white rounded-xl p-4 card-shadow flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Store className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Manage Shops</p>
                <p className="text-sm text-gray-500">View all shops</p>
              </div>
            </Link>

            <Link
              href="/admin/customers"
              className="bg-white rounded-xl p-4 card-shadow flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Customers</p>
                <p className="text-sm text-gray-500">View all users</p>
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="bg-white rounded-xl p-4 card-shadow flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <ShoppingBag className="text-green-600" size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">All Orders</p>
                <p className="text-sm text-gray-500">Platform orders</p>
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              className="bg-white rounded-xl p-4 card-shadow flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <BarChart3 className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Analytics</p>
                <p className="text-sm text-gray-500">Platform stats</p>
              </div>
            </Link>
          </div>

          {/* Pending Shop Approvals */}
          <div className="bg-white rounded-2xl p-4 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Clock className="text-orange-500" size={20} />
                Pending Approvals
              </h2>
              {pendingShops.length > 0 && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
                  {pendingShops.length}
                </span>
              )}
            </div>

            {pendingShops.length > 0 ? (
              <div className="space-y-3">
                {pendingShops.map((shop) => (
                  <div key={shop.shopId} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{shop.shopName}</p>
                        <p className="text-sm text-gray-500">{shop.ownerName} • {shop.phone}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{shop.address}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Category: {shop.category} • Delivery: ₹{shop.deliveryCharge}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(shop.shopId)}
                        className="flex-1 py-2 rounded-lg bg-green-100 text-green-600 font-medium flex items-center justify-center gap-1"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(shop.shopId)}
                        className="flex-1 py-2 rounded-lg bg-red-100 text-red-600 font-medium flex items-center justify-center gap-1"
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No pending approvals</p>
            )}
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}
