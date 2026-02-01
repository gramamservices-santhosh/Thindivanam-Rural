'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Store, MapPin, Truck, Clock, IndianRupee, LogOut, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, shopData, loading: authLoading, updateShopData, logout } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    address: '',
    deliveryCharge: '',
    deliveryRadius: '',
    openTime: '',
    closeTime: '',
    isOpen: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (shopData) {
      setFormData({
        shopName: shopData.shopName,
        address: shopData.address,
        deliveryCharge: String(shopData.deliveryCharge),
        deliveryRadius: String(shopData.deliveryRadius),
        openTime: shopData.businessHours.open,
        closeTime: shopData.businessHours.close,
        isOpen: shopData.isOpen,
      });
    }
  }, [shopData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateShopData({
        shopName: formData.shopName,
        address: formData.address,
        deliveryCharge: parseInt(formData.deliveryCharge) || 0,
        deliveryRadius: Math.min(parseInt(formData.deliveryRadius) || 0, 10),
        businessHours: {
          open: formData.openTime,
          close: formData.closeTime,
        },
        isOpen: formData.isOpen,
      });
      showToast('Settings saved!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleShop = async () => {
    const newStatus = !formData.isOpen;
    setFormData((prev) => ({ ...prev, isOpen: newStatus }));
    try {
      await updateShopData({ isOpen: newStatus });
      showToast(`Shop is now ${newStatus ? 'open' : 'closed'}`, 'success');
    } catch (error) {
      setFormData((prev) => ({ ...prev, isOpen: !newStatus }));
      showToast('Failed to update shop status', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!shopData) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <Store className="text-amber-600" size={32} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Shop Data Not Found</h2>
        <p className="text-slate-500 text-sm text-center">Unable to load your shop data. Please try logging in again.</p>
        <button
          onClick={handleLogout}
          className="btn-primary mt-4"
        >
          Logout and Try Again
        </button>
      </div>
    );
  }

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
          <h1 className="text-white text-xl font-bold flex-1">Settings</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Shop Status Toggle */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                formData.isOpen ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Store className={formData.isOpen ? 'text-green-600' : 'text-gray-400'} size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Shop Status</p>
                <p className={`text-sm ${formData.isOpen ? 'text-green-600' : 'text-gray-500'}`}>
                  {formData.isOpen ? 'Open for orders' : 'Closed'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleShop}
              className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${
                formData.isOpen ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  formData.isOpen ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Shop Details */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Shop Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => setFormData((p) => ({ ...p, shopName: e.target.value }))}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                  rows={2}
                  className="input-field pl-10 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Business Settings</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    value={formData.deliveryCharge}
                    onChange={(e) => setFormData((p) => ({ ...p, deliveryCharge: e.target.value }))}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Radius (km)</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    value={formData.deliveryRadius}
                    onChange={(e) => setFormData((p) => ({ ...p, deliveryRadius: e.target.value }))}
                    max={10}
                    className="input-field pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Max 10 km</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Open Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="time"
                      value={formData.openTime}
                      onChange={(e) => setFormData((p) => ({ ...p, openTime: e.target.value }))}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Close Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="time"
                      value={formData.closeTime}
                      onChange={(e) => setFormData((p) => ({ ...p, closeTime: e.target.value }))}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>

        {/* Shop Info (Read-only) */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Shop Information</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Owner:</span> {shopData.ownerName}</p>
            <p><span className="text-gray-500">Phone:</span> {shopData.phone}</p>
            <p><span className="text-gray-500">Category:</span> {shopData.category}</p>
            <p><span className="text-gray-500">Status:</span> {shopData.status}</p>
            <p><span className="text-gray-500">Commission Rate:</span> {shopData.commissionRate}%</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 rounded-2xl text-red-600 font-semibold"
        >
          <LogOut size={20} />
          Logout
        </button>

        {/* App Version */}
        <p className="text-center text-sm text-gray-400 mt-4">
          Nam Tindivanam Shop Owner v1.0.0
        </p>
      </div>
    </div>
  );
}
