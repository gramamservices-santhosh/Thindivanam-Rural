import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shop, User, Order, PlatformStats } from '@/types';

// Shops
export async function getAllShops(): Promise<Shop[]> {
  const q = query(collection(db, 'shops'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), shopId: doc.id } as Shop));
}

export async function getShopsByStatus(status: Shop['status']): Promise<Shop[]> {
  const q = query(
    collection(db, 'shops'),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), shopId: doc.id } as Shop));
}

export async function approveShop(shopId: string): Promise<void> {
  await updateDoc(doc(db, 'shops', shopId), {
    status: 'active',
    isOpen: true,
    updatedAt: Timestamp.now(),
  });
}

export async function suspendShop(shopId: string): Promise<void> {
  await updateDoc(doc(db, 'shops', shopId), {
    status: 'suspended',
    isOpen: false,
    updatedAt: Timestamp.now(),
  });
}

export async function reactivateShop(shopId: string): Promise<void> {
  await updateDoc(doc(db, 'shops', shopId), {
    status: 'active',
    updatedAt: Timestamp.now(),
  });
}

export async function updateShopCommission(shopId: string, commissionRate: number): Promise<void> {
  await updateDoc(doc(db, 'shops', shopId), {
    commissionRate,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteShop(shopId: string): Promise<void> {
  await deleteDoc(doc(db, 'shops', shopId));
}

// Customers
export async function getAllCustomers(): Promise<User[]> {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), userId: doc.id } as User));
}

// Orders
export async function getAllOrders(): Promise<Order[]> {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Order);
}

// Platform Stats
export async function getPlatformStats(): Promise<PlatformStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [shopsSnapshot, usersSnapshot, ordersSnapshot] = await Promise.all([
    getDocs(collection(db, 'shops')),
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'orders')),
  ]);

  const shops = shopsSnapshot.docs.map((doc) => doc.data() as Shop);
  const orders = ordersSnapshot.docs.map((doc) => doc.data() as Order);

  const todayOrders = orders.filter((o) => {
    const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  const todayRevenue = todayOrders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  return {
    totalOrdersToday: todayOrders.length,
    totalRevenueToday: todayRevenue,
    activeShops: shops.filter((s) => s.status === 'active').length,
    totalCustomers: usersSnapshot.size,
    pendingShops: shops.filter((s) => s.status === 'pending').length,
  };
}
