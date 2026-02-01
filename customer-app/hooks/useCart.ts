'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  shopId: string | null;
  shopName: string | null;
  deliveryCharge: number;

  addItem: (item: CartItem, deliveryCharge?: number) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      shopId: null,
      shopName: null,
      deliveryCharge: 0,

      addItem: (item: CartItem, deliveryCharge?: number) => {
        const { items, shopId } = get();

        // Check if trying to add from different shop
        if (shopId && shopId !== item.shopId) {
          // Return false to indicate cart conflict
          return false;
        }

        // Check if item already in cart
        const existingIndex = items.findIndex((i) => i.productId === item.productId);

        if (existingIndex !== -1) {
          // Update quantity
          const newItems = [...items];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + item.quantity,
          };
          set({ items: newItems });
        } else {
          // Add new item
          set({
            items: [...items, item],
            shopId: item.shopId,
            shopName: item.shopName,
            deliveryCharge: deliveryCharge ?? get().deliveryCharge,
          });
        }
        return true;
      },

      removeItem: (productId: string) => {
        const newItems = get().items.filter((i) => i.productId !== productId);
        if (newItems.length === 0) {
          set({ items: [], shopId: null, shopName: null, deliveryCharge: 0 });
        } else {
          set({ items: newItems });
        }
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [], shopId: null, shopName: null, deliveryCharge: 0 });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getTotal: () => {
        return get().getSubtotal() + get().deliveryCharge;
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'nam-tindivanam-cart',
    }
  )
);

// Helper hook to handle cart conflicts
export const useCartActions = () => {
  const cart = useCart();

  const addToCart = (item: CartItem, deliveryCharge?: number): { success: boolean; conflict: boolean } => {
    const success = cart.addItem(item, deliveryCharge);
    return { success, conflict: !success };
  };

  const clearAndAdd = (item: CartItem, deliveryCharge?: number) => {
    cart.clearCart();
    cart.addItem(item, deliveryCharge);
  };

  return {
    ...cart,
    addToCart,
    clearAndAdd,
  };
};
