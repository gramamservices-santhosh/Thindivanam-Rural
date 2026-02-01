'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Heart, Bell, HelpCircle, LogOut, ChevronRight, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userData, loading: authLoading, logout } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      router.push('/login');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <User className="text-amber-600" size={32} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-slate-500 text-sm text-center">Unable to load your profile. Please try logging in again.</p>
        <button
          onClick={handleLogout}
          className="btn-primary mt-4"
        >
          Logout and Try Again
        </button>
      </div>
    );
  }

  const menuItems = [
    {
      icon: MapPin,
      label: 'Manage Addresses',
      description: `${userData.addresses?.length || 0} saved addresses`,
      onClick: () => {},
    },
    {
      icon: Heart,
      label: 'Favorite Shops',
      description: 'View your favorite shops',
      onClick: () => {},
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage notification settings',
      onClick: () => {},
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help with your orders',
      onClick: () => {},
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-customer px-4 pt-8 pb-12 rounded-b-[30px]">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">{userData.name}</h1>
            <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
              <Phone size={14} />
              <span>{userData.phone}</span>
            </div>
            {userData.email && (
              <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                <Mail size={14} />
                <span>{userData.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-4 -mt-6">
        {/* Stats Card */}
        <div className="bg-white rounded-2xl p-4 card-shadow mb-4">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-xs text-gray-500">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-xs text-gray-500">Favorites</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{userData.addresses?.length || 0}</p>
              <p className="text-xs text-gray-500">Addresses</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <item.icon size={20} className="text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 flex items-center justify-center gap-2 p-4 bg-red-50 rounded-2xl text-red-600 font-semibold"
        >
          <LogOut size={20} />
          Logout
        </button>

        {/* App Version */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Nam Tindivanam v1.0.0
        </p>
      </div>
    </div>
  );
}
