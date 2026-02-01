'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Star, Clock, Truck, MapPin, Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCartActions } from '@/hooks/useCart';
import { useToast } from '@/components/Toast';
import { getShopById } from '@/lib/firestore/shops';
import { getProductsByShop, getProductById } from '@/lib/firestore/products';
import { Shop, Product, CartItem } from '@/types';

const categoryIcons: Record<string, string> = {
  vegetables: '🥬',
  groceries: '🛒',
  dairy: '🥛',
  snacks: '🍪',
  other: '📦',
};

export default function ShopDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items: cartItems, addToCart, clearAndAdd, shopId: cartShopId } = useCartActions();
  const { showToast } = useToast();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingItem, setPendingItem] = useState<{ item: CartItem; deliveryCharge: number } | null>(null);

  const shopId = params.shopId as string;
  const highlightProductId = searchParams.get('product');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [shopData, productsData] = await Promise.all([
          getShopById(shopId),
          getProductsByShop(shopId),
        ]);

        setShop(shopData);
        setProducts(productsData);

        // If there's a highlighted product, find and set it
        if (highlightProductId) {
          const highlighted = productsData.find((p) => p.productId === highlightProductId);
          if (highlighted) {
            setSelectedProduct(highlighted);
            setQuantities({ [highlighted.productId]: 1 });
          }
        }
      } catch (error) {
        console.error('Error fetching shop data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchData();
    }
  }, [shopId, highlightProductId]);

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      const newQty = Math.max(0, current + delta);
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.productId] || 1;

    const item: CartItem = {
      shopId: shop!.shopId,
      shopName: shop!.shopName,
      productId: product.productId,
      productName: product.name,
      price: product.offerPrice || product.price,
      quantity,
      unit: product.unit,
      imageUrl: product.imageUrl,
    };

    const { success, conflict } = addToCart(item, shop!.deliveryCharge);

    if (conflict) {
      setPendingItem({ item, deliveryCharge: shop!.deliveryCharge });
      setShowConflictModal(true);
    } else {
      showToast(`${product.name} added to cart!`, 'success');
      setQuantities((prev) => {
        const { [product.productId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleClearAndAdd = () => {
    if (pendingItem) {
      clearAndAdd(pendingItem.item, pendingItem.deliveryCharge);
      showToast(`${pendingItem.item.productName} added to cart!`, 'success');
      setQuantities((prev) => {
        const { [pendingItem.item.productId]: _, ...rest } = prev;
        return rest;
      });
    }
    setShowConflictModal(false);
    setPendingItem(null);
  };

  const isInCart = (productId: string) => {
    return cartItems.some((item) => item.productId === productId && item.shopId === shopId);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Shop not found</h2>
        <button onClick={() => router.push('/')} className="btn-primary">
          Go Home
        </button>
      </div>
    );
  }

  const icon = categoryIcons[shop.category] || '🏪';

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
            <h1 className="text-white text-xl font-bold">{shop.shopName}</h1>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Star size={14} fill="currentColor" />
              <span>{shop.rating.toFixed(1)} ({shop.totalReviews} reviews)</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
            {icon}
          </div>
        </div>

        {/* Shop Info */}
        <div className="flex items-center gap-4 text-white/90 text-sm">
          <div className="flex items-center gap-1">
            <Truck size={14} />
            <span>₹{shop.deliveryCharge}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{shop.businessHours.open} - {shop.businessHours.close}</span>
          </div>
        </div>
      </div>

      {/* Selected Product (if any) */}
      {selectedProduct && (
        <div className="px-4 py-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Selected Product</h2>
          <div className="bg-white rounded-2xl p-4 card-shadow border-2 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  categoryIcons[selectedProduct.category] || '📦'
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{selectedProduct.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-600 text-lg">
                    ₹{selectedProduct.offerPrice || selectedProduct.price}/{selectedProduct.unit}
                  </span>
                  {selectedProduct.offerPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{selectedProduct.price}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(selectedProduct.productId, -1)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-semibold text-lg">
                  {quantities[selectedProduct.productId] || 1}
                </span>
                <button
                  onClick={() => handleQuantityChange(selectedProduct.productId, 1)}
                  className="w-10 h-10 rounded-full gradient-customer flex items-center justify-center text-white"
                >
                  <Plus size={18} />
                </button>
              </div>
              <button
                onClick={() => handleAddToCart(selectedProduct)}
                className="btn-primary flex items-center gap-2"
              >
                {isInCart(selectedProduct.productId) ? (
                  <>
                    <Check size={18} />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Products */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          {selectedProduct ? 'Other Products' : 'All Products'}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {products
            .filter((p) => p.productId !== selectedProduct?.productId)
            .map((product) => (
              <div
                key={product.productId}
                className="bg-white rounded-2xl p-3 card-shadow"
              >
                <div className="w-full h-20 rounded-xl bg-gray-100 flex items-center justify-center text-3xl mb-2">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    categoryIcons[product.category] || '📦'
                  )}
                </div>
                <h3 className="font-medium text-gray-800 text-sm truncate">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <span className="font-bold text-purple-600">
                    ₹{product.offerPrice || product.price}
                  </span>
                  <span className="text-xs text-gray-500">/{product.unit}</span>
                </div>

                {/* Quick Add */}
                {quantities[product.productId] ? (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleQuantityChange(product.productId, -1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-semibold">{quantities[product.productId]}</span>
                    <button
                      onClick={() => handleQuantityChange(product.productId, 1)}
                      className="w-8 h-8 rounded-full gradient-customer flex items-center justify-center text-white"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setQuantities((prev) => ({ ...prev, [product.productId]: 1 }))}
                    className="w-full py-2 rounded-lg bg-purple-100 text-purple-600 font-medium text-sm flex items-center justify-center gap-1"
                  >
                    <Plus size={16} /> Add
                  </button>
                )}
              </div>
            ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No products available</p>
          </div>
        )}
      </div>

      {/* Cart Conflict Modal */}
      {showConflictModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Clear cart?
            </h3>
            <p className="text-gray-600 mb-6">
              Your cart has items from another shop. Clear cart to order from {shop.shopName}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConflictModal(false);
                  setPendingItem(null);
                }}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAndAdd}
                className="flex-1 btn-primary"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
