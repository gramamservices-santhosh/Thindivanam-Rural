'use client';

import Link from 'next/link';
import { Star, MapPin, Truck, Clock } from 'lucide-react';
import { Shop } from '@/types';

interface ShopCardProps {
  shop: Shop;
  price: number;
  offerPrice?: number;
  productId: string;
  productName: string;
}

const categoryIcons: Record<string, string> = {
  vegetables: '🥬',
  groceries: '🛒',
  dairy: '🥛',
  mixed: '🏪',
  snacks: '🍪',
};

export default function ShopCard({ shop, price, offerPrice, productId, productName }: ShopCardProps) {
  const icon = categoryIcons[shop.category] || '🏪';
  const displayPrice = offerPrice || price;
  const hasDiscount = offerPrice && offerPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - offerPrice) / price) * 100) : 0;

  return (
    <Link
      href={`/shop/${shop.shopId}?product=${productId}&name=${encodeURIComponent(productName)}`}
      className="bg-white rounded-2xl p-4 card-shadow card-shadow-hover block"
    >
      <div className="flex items-start gap-3">
        {/* Shop Icon */}
        <div className="w-14 h-14 rounded-xl gradient-brand flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>

        {/* Shop Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{shop.shopName}</h3>

          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center text-yellow-500">
              <Star size={14} fill="currentColor" />
              <span className="text-sm text-gray-700 ml-1">
                {shop.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">
              {shop.totalReviews} reviews
            </span>
          </div>

          {/* Price at this shop */}
          <div className="mt-2 flex items-center gap-2">
            <span className="font-bold text-lg text-purple-600">
              ₹{displayPrice}
            </span>
            {hasDiscount && (
              <>
                <span className="text-sm text-gray-400 line-through">₹{price}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Truck size={14} className="text-purple-500" />
          <span>₹{shop.deliveryCharge} delivery</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock size={14} className="text-purple-500" />
          <span>30-45 mins</span>
        </div>
      </div>
    </Link>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 card-shadow animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 bg-gray-200 rounded-xl" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
}
