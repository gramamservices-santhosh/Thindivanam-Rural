'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ShopCard, { ShopCardSkeleton } from '@/components/ShopCard';
import { getShopsSellingProduct, ShopWithProduct } from '@/lib/firestore/shops';

export default function ProductShopsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [shops, setShops] = useState<ShopWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const productName = decodeURIComponent(params.productName as string);
  const displayName = productName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const result = await getShopsSellingProduct(productName);
        setShops(result);
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productName) {
      fetchShops();
    }
  }, [productName]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-customer px-4 pt-4 pb-6 rounded-b-[30px]">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold">{displayName}</h1>
            <p className="text-white/80 text-sm">
              {loading ? 'Loading...' : `Available in ${shops.length} ${shops.length === 1 ? 'shop' : 'shops'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Shops List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <ShopCardSkeleton key={i} />
            ))}
          </div>
        ) : shops.length > 0 ? (
          <div className="space-y-3">
            {shops.map((item) => (
              <ShopCard
                key={item.shop.shopId}
                shop={item.shop}
                price={item.price}
                offerPrice={item.offerPrice}
                productId={item.productId}
                productName={displayName}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Store size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No shops available
            </h3>
            <p className="text-gray-500 mb-6">
              No shops are currently selling {displayName}
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Browse Other Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
