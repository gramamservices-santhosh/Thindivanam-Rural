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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
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
      <div className="gradient-customer px-4 pt-6 pb-8 rounded-b-[30px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">Hello,</p>
            <h1 className="text-white text-xl font-bold">
              {userData?.name || 'Customer'}!
            </h1>
          </div>
          <img src="/logo.svg" alt="Nam Tindivanam" className="h-10" />
        </div>

        {/* Location */}
        {defaultAddress && (
          <div className="flex items-center gap-2 text-white/90 text-sm mb-4">
            <MapPin size={16} />
            <span className="truncate">{defaultAddress.address}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for vegetables, groceries..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'gradient-customer text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="font-medium text-sm">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : selectedCategory === 'all'
              ? 'All Products'
              : `${categories.find((c) => c.id === selectedCategory)?.label}`}
          </h2>
          <span className="text-sm text-gray-500">
            {products.length} items
          </span>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.name} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
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
