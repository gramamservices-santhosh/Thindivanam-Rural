'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Trash2, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import CartItem from '@/components/CartItem';

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, shopName, deliveryCharge, getSubtotal, getTotal, clearCart } = useCart();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

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

  const subtotal = getSubtotal();
  const total = getTotal();

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="gradient-customer px-4 pt-4 pb-6 rounded-b-[30px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-white text-xl font-bold flex-1">My Cart</h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Cart Content */}
      <div className="px-4 py-4">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag size={48} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some delicious items to your cart
            </p>
            <Link href="/" className="btn-primary inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Shop Name */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center">
                <Store size={20} className="text-white" />
              </div>
              <span className="font-semibold text-gray-800">{shopName}</span>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>

            {/* Bill Details */}
            <div className="bg-white rounded-2xl p-4 card-shadow">
              <h3 className="font-semibold text-gray-800 mb-4">Bill Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Item Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-800 pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-purple-600">₹{total}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Checkout Button (Fixed at Bottom) */}
      {items.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <div className="max-w-lg mx-auto">
            <Link
              href="/checkout"
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
            >
              Proceed to Checkout • ₹{total}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
