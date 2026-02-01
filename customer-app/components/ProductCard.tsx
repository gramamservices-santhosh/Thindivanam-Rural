'use client';

import Link from 'next/link';
import { Package, Store } from 'lucide-react';
import { GroupedProduct } from '@/types';

interface ProductCardProps {
  product: GroupedProduct;
}

const categoryIcons: Record<string, string> = {
  vegetables: '🥬',
  groceries: '🛒',
  dairy: '🥛',
  snacks: '🍪',
  other: '📦',
};

export default function ProductCard({ product }: ProductCardProps) {
  const icon = categoryIcons[product.category] || categoryIcons.other;

  return (
    <Link
      href={`/products/${encodeURIComponent(product.name.toLowerCase())}`}
      className="bg-white rounded-2xl p-4 card-shadow card-shadow-hover flex flex-col items-center text-center"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
        {product.name}
      </h3>
      <p className="text-purple-600 font-bold text-sm mb-1">
        From ₹{product.minPrice}
      </p>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Store size={12} />
        <span>{product.shopCount} {product.shopCount === 1 ? 'shop' : 'shops'}</span>
      </div>
    </Link>
  );
}

// Skeleton loader for product cards
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 card-shadow animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
      <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto" />
    </div>
  );
}
