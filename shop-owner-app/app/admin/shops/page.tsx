'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Store, Check, X, RefreshCw, Trash2, Percent } from 'lucide-react';
import AdminOnly from '@/components/AdminOnly';
import { useToast } from '@/components/Toast';
import { getAllShops, approveShop, suspendShop, reactivateShop, updateShopCommission, deleteShop } from '@/lib/firestore/admin';
import { Shop } from '@/types';

const statusTabs = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'active', label: 'Active' },
  { id: 'suspended', label: 'Suspended' },
];

export default function AdminShopsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [commissionModal, setCommissionModal] = useState<{ shopId: string; rate: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const data = await getAllShops();
      setShops(data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleApprove = async (shopId: string) => {
    try {
      await approveShop(shopId);
      showToast('Shop approved!', 'success');
      fetchShops();
    } catch (error) {
      showToast('Failed to approve shop', 'error');
    }
  };

  const handleSuspend = async (shopId: string) => {
    try {
      await suspendShop(shopId);
      showToast('Shop suspended', 'warning');
      fetchShops();
    } catch (error) {
      showToast('Failed to suspend shop', 'error');
    }
  };

  const handleReactivate = async (shopId: string) => {
    try {
      await reactivateShop(shopId);
      showToast('Shop reactivated!', 'success');
      fetchShops();
    } catch (error) {
      showToast('Failed to reactivate shop', 'error');
    }
  };

  const handleUpdateCommission = async () => {
    if (!commissionModal) return;
    try {
      await updateShopCommission(commissionModal.shopId, commissionModal.rate);
      showToast('Commission updated!', 'success');
      setCommissionModal(null);
      fetchShops();
    } catch (error) {
      showToast('Failed to update commission', 'error');
    }
  };

  const handleDelete = async (shopId: string) => {
    try {
      await deleteShop(shopId);
      showToast('Shop deleted', 'success');
      setDeleteConfirm(null);
      fetchShops();
    } catch (error) {
      showToast('Failed to delete shop', 'error');
    }
  };

  const filteredShops = activeTab === 'all'
    ? shops
    : shops.filter((s) => s.status === activeTab);

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
            <h1 className="text-white text-xl font-bold flex-1">Manage Shops</h1>
            <button
              onClick={fetchShops}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="px-4 py-3 overflow-x-auto">
          <div className="flex gap-2">
            {statusTabs.map((tab) => {
              const count = tab.id === 'all'
                ? shops.length
                : shops.filter((s) => s.status === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium text-sm">{tab.label}</span>
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shops List */}
        <div className="px-4 py-2 space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 card-shadow animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))
          ) : filteredShops.length > 0 ? (
            filteredShops.map((shop) => (
              <div key={shop.shopId} className="bg-white rounded-2xl p-4 card-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{shop.shopName}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          shop.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : shop.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {shop.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{shop.ownerName} • {shop.phone}</p>
                  </div>
                  {shop.isAdmin && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      Admin
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-2">{shop.address}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>Category: {shop.category}</span>
                  <span>Delivery: ₹{shop.deliveryCharge}</span>
                  <span>Commission: {shop.commissionRate}%</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {shop.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(shop.shopId)}
                        className="px-3 py-1.5 rounded-lg bg-green-100 text-green-600 font-medium text-sm flex items-center gap-1"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleSuspend(shop.shopId)}
                        className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 font-medium text-sm flex items-center gap-1"
                      >
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}

                  {shop.status === 'active' && !shop.isAdmin && (
                    <button
                      onClick={() => handleSuspend(shop.shopId)}
                      className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 font-medium text-sm flex items-center gap-1"
                    >
                      <X size={14} /> Suspend
                    </button>
                  )}

                  {shop.status === 'suspended' && (
                    <button
                      onClick={() => handleReactivate(shop.shopId)}
                      className="px-3 py-1.5 rounded-lg bg-green-100 text-green-600 font-medium text-sm flex items-center gap-1"
                    >
                      <Check size={14} /> Reactivate
                    </button>
                  )}

                  <button
                    onClick={() => setCommissionModal({ shopId: shop.shopId, rate: shop.commissionRate })}
                    className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-600 font-medium text-sm flex items-center gap-1"
                  >
                    <Percent size={14} /> Commission
                  </button>

                  {!shop.isAdmin && (
                    <button
                      onClick={() => setDeleteConfirm(shop.shopId)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-medium text-sm flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Store size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No shops found</p>
            </div>
          )}
        </div>

        {/* Commission Modal */}
        {commissionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Update Commission Rate</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
                <input
                  type="number"
                  value={commissionModal.rate}
                  onChange={(e) => setCommissionModal((p) => p ? { ...p, rate: Number(e.target.value) } : null)}
                  min={0}
                  max={100}
                  className="input-field"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCommissionModal(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button onClick={handleUpdateCommission} className="flex-1 btn-primary">
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Shop?</h3>
              <p className="text-gray-600 mb-6">This will permanently delete the shop and all its data.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminOnly>
  );
}
