'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderStatus } from '@/types';

interface UseOrdersOptions {
  shopId: string | undefined;
  onNewOrder?: (order: Order) => void;
}

export function useOrders({ shopId, onNewOrder }: UseOrdersOptions) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3');
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.log('Audio play failed:', e));
    }
  }, []);

  useEffect(() => {
    if (!shopId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'orders'),
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersList: Order[] = [];

        snapshot.forEach((doc) => {
          ordersList.push(doc.data() as Order);
        });

        // Check for new orders (only after initial load)
        if (!initialLoadRef.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const newOrder = change.doc.data() as Order;
              if (newOrder.status === 'pending') {
                playNotificationSound();
                onNewOrder?.(newOrder);
              }
            }
          });
        }

        setOrders(ordersList);
        setLoading(false);
        initialLoadRef.current = false;
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [shopId, onNewOrder, playNotificationSound]);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    additionalData?: Partial<Order>
  ) => {
    const orderDoc = orders.find((o) => o.orderId === orderId);
    if (!orderDoc) return;

    // Find the document by orderId field
    const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
    const snapshot = await new Promise<any>((resolve) => {
      const unsub = onSnapshot(q, (snap) => {
        unsub();
        resolve(snap);
      });
    });

    if (snapshot.empty) return;

    const docRef = doc(db, 'orders', snapshot.docs[0].id);

    const updateData: any = {
      status: newStatus,
      updatedAt: Timestamp.now(),
      ...additionalData,
    };

    // Add timestamp for specific statuses
    if (newStatus === 'accepted') {
      updateData.acceptedAt = Timestamp.now();
    } else if (newStatus === 'packed') {
      updateData.packedAt = Timestamp.now();
    } else if (newStatus === 'delivered') {
      updateData.deliveredAt = Timestamp.now();
      updateData.paymentStatus = 'completed';
    }

    await updateDoc(docRef, updateData);
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const acceptedOrders = orders.filter((o) => o.status === 'accepted');
  const packedOrders = orders.filter((o) => o.status === 'packed');
  const outForDeliveryOrders = orders.filter((o) => o.status === 'out_for_delivery');
  const completedOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'rejected');

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    pendingOrders,
    acceptedOrders,
    packedOrders,
    outForDeliveryOrders,
    completedOrders,
    pendingCount: pendingOrders.length,
  };
}
