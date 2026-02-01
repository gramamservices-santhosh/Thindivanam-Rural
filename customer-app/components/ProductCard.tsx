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
      className="bg-white rounded-2xl p-4 card-shadow card-hover flex flex-col items-center text-center border border-slate-100"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center mb-3">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2 leading-tight">
        {product.name}
      </h3>
      <p className="text-indigo-600 font-bold text-base mb-2">
        From ₹{product.minPrice}
      </p>
      <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
        <Store size={12} />
        <span className="font-medium">{product.shopCount} {product.shopCount === 1 ? 'shop' : 'shops'}</span>
      </div>
    </Link>
  );
}

// Skeleton loader for product cards
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 card-shadow border border-slate-100">
      <div className="w-14 h-14 skeleton rounded-2xl mx-auto mb-3" />
      <div className="h-4 skeleton rounded-lg w-3/4 mx-auto mb-2" />
      <div className="h-5 skeleton rounded-lg w-1/2 mx-auto mb-2" />
      <div className="h-6 skeleton rounded-full w-20 mx-auto" />
    </div>
  );
}
