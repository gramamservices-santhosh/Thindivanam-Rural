'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, Package, BarChart3, Settings, Shield } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function BottomNav() {
  const pathname = usePathname();
  const { shopData } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { pendingCount } = useOrders({ shopId: shopData?.shopId });

  // Don't show on login/register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/orders', icon: ClipboardList, label: 'Orders', badge: pendingCount },
    { href: '/products', icon: Package, label: 'Products' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    ...(isAdmin ? [{ href: '/admin', icon: Shield, label: 'Admin' }] : []),
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Limit to 5 items for mobile
  const displayItems = navItems.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {displayItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors relative ${
                isActive
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold animate-pulse">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
