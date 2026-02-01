'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Plus, CreditCard, Truck, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/Toast';
import { createOrder } from '@/lib/firestore/orders';
import { getShopById } from '@/lib/firestore/shops';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const { items, shopId, shopName, deliveryCharge, getSubtotal, getTotal, clearCart } = useCart();
  const { showToast } = useToast();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (userData?.addresses?.length) {
      const defaultAddr = userData.addresses.find((a) => a.isDefault);
      setSelectedAddressId(defaultAddr?.id || userData.addresses[0].id);
    }
  }, [userData]);

  useEffect(() => {
    if (!authLoading && user && items.length === 0 && !orderSuccess) {
      router.push('/cart');
    }
  }, [authLoading, user, items, orderSuccess, router]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !userData || !shopId) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    const selectedAddress = userData.addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      showToast('Invalid address selected', 'error');
      return;
    }

    setLoading(true);
    try {
      // Get shop commission rate
      const shop = await getShopById(shopId);
      const commissionRate = shop?.commissionRate || 10;

      const newOrderId = await createOrder({
        customerId: user!.uid,
        customerName: userData.name,
        customerPhone: userData.phone,
        deliveryAddress: selectedAddress.address + (selectedAddress.landmark ? ` (${selectedAddress.landmark})` : ''),
        shopId,
        shopName: shopName!,
        items,
        deliveryCharge,
        commissionRate,
      });

      setOrderId(newOrderId);
      setOrderSuccess(true);
      clearCart();
      showToast('Order placed successfully!', 'success');
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!orderSuccess && items.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  // Order Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle size={60} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h1>
        <p className="text-gray-500 text-center mb-2">
          Your order has been placed successfully
        </p>
        <p className="text-lg font-semibold text-purple-600 mb-6">
          Order ID: #{orderId}
        </p>
        <p className="text-gray-500 text-center mb-8">
          Your order will be delivered in 30-45 minutes
        </p>
        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={() => router.push('/orders')}
            className="flex-1 btn-primary"
          >
            Track Order
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700"
          >
            Home
          </button>
        </div>
      </div>
    );
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
          <h1 className="text-white text-xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <MapPin size={18} className="text-purple-600" />
              Delivery Address
            </h3>
          </div>

          <div className="space-y-3">
            {userData?.addresses?.map((address) => (
              <label
                key={address.id}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedAddressId === address.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === address.id}
                  onChange={() => setSelectedAddressId(address.id)}
                  className="mt-1 accent-purple-600"
                />
                <div>
                  <p className="text-gray-800">{address.address}</p>
                  {address.landmark && (
                    <p className="text-sm text-gray-500">{address.landmark}</p>
                  )}
                  {address.isDefault && (
                    <span className="text-xs text-purple-600 font-medium">Default</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.productName}
                </span>
                <span className="text-gray-800">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>₹{deliveryCharge}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-800 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-purple-600">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-purple-600" />
            Payment Method
          </h3>
          <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-purple-500 bg-purple-50">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Truck size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Cash on Delivery</p>
              <p className="text-sm text-gray-500">Pay when you receive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handlePlaceOrder}
            disabled={loading || !selectedAddressId}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Placing Order...
              </>
            ) : (
              <>Place Order • ₹{total}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
