'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { getGroupedProducts, searchGroupedProducts } from '@/lib/firestore/products';
import { GroupedProduct } from '@/types';

const categories = [
  { id: 'all', label: 'All', icon: '🛒' },
  { id: 'vegetables', label: 'Vegetables', icon: '🥬' },
  { id: 'groceries', label: 'Groceries', icon: '🍚' },
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
  { id: 'snacks', label: 'Snacks', icon: '🍪' },
];

export default function HomePage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<GroupedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let result: GroupedProduct[];
        if (searchQuery.trim()) {
          result = await searchGroupedProducts(searchQuery);
        } else {
          result = await getGroupedProducts(selectedCategory);
        }
        setProducts(result);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedCategory]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const defaultAddress = userData?.addresses?.find((a) => a.isDefault);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-customer px-5 pt-6 pb-10 rounded-b-[32px]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/70 text-sm font-medium">Hello,</p>
            <h1 className="text-white text-xl font-bold tracking-tight">
              {userData?.name || 'Customer'}!
            </h1>
          </div>
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <span className="text-xl">🛒</span>
          </div>
        </div>

        {/* Location */}
        {defaultAddress && (
          <div className="flex items-center gap-2 text-white/80 text-sm mb-5 bg-white/10 px-3 py-2 rounded-xl w-fit max-w-full">
            <MapPin size={16} className="flex-shrink-0" />
            <span className="truncate font-medium">{defaultAddress.address}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for vegetables, groceries..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg font-medium text-[15px]"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 py-5">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'gradient-customer text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="font-semibold text-sm">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : selectedCategory === 'all'
              ? 'All Products'
              : `${categories.find((c) => c.id === selectedCategory)?.label}`}
          </h2>
          <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
            {products.length} items
          </span>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            {products.map((product) => (
              <ProductCard key={product.name} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              No products found
            </h3>
            <p className="text-slate-500 text-sm">
              {searchQuery
                ? 'Try a different search term'
                : 'No products available in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
