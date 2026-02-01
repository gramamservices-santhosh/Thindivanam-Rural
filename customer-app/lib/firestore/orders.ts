import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderItem, CartItem } from '@/types';

function generateOrderId(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TDN${random}`;
}

export interface CreateOrderData {
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  shopId: string;
  shopName: string;
  items: CartItem[];
  deliveryCharge: number;
  commissionRate: number;
}

export async function createOrder(data: CreateOrderData): Promise<string> {
  const orderItems: OrderItem[] = data.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    price: item.price,
    quantity: item.quantity,
    unit: item.unit,
    subtotal: item.price * item.quantity,
  }));

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + data.deliveryCharge;
  const commissionAmount = Math.round((total * data.commissionRate) / 100);

  const orderId = generateOrderId();
  const order: Order = {
    orderId,
    customerId: data.customerId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    deliveryAddress: data.deliveryAddress,
    shopId: data.shopId,
    shopName: data.shopName,
    items: orderItems,
    subtotal,
    deliveryCharge: data.deliveryCharge,
    total,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'pending',
    commissionAmount,
    commissionPaid: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await addDoc(collection(db, 'orders'), order);
  return orderId;
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data() } as Order));
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const q = query(
    collection(db, 'orders'),
    where('orderId', '==', orderId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs[0].data() as Order;
}

export function getStatusText(status: Order['status']): string {
  const statusMap: Record<Order['status'], string> = {
    pending: 'Order Placed',
    accepted: 'Order Accepted',
    packed: 'Order Packed',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    rejected: 'Order Rejected',
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: Order['status']): string {
  const colorMap: Record<Order['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    packed: 'bg-indigo-100 text-indigo-800',
    out_for_delivery: 'bg-pink-100 text-pink-800',
    delivered: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}
