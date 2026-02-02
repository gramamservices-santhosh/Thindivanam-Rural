'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Shield } from 'lucide-react';

interface AdminOnlyProps {
  children: React.ReactNode;
}

export default function AdminOnly({ children }: AdminOnlyProps) {
  const router = useRouter();
  const { isAdmin, loading } = useIsAdmin();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <Shield size={40} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-500 text-center">You don't have admin permissions.</p>
      </div>
    );
  }

  return <>{children}</>;
}
