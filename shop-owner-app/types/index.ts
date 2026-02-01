import { Timestamp } from 'firebase/firestore';

export interface Address {
  id: string;
  address: string;
  landmark?: string;
  isDefault: boolean;
}

export interface User {
  userId: string;
  name: string;
  phone: string;
  email?: string;
  addresses: Address[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BusinessHours {
  open: string;
  close: string;
}

export interface Shop {
  shopId: string;
  ownerId: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email?: string;
  address: string;
  category: 'vegetables' | 'groceries' | 'dairy' | 'mixed' | 'snacks';
  deliveryCharge: number;
  deliveryRadius: number;
  businessHours: BusinessHours;
  rating: number;
  totalReviews: number;
  totalOrders: number;
  status: 'pending' | 'active' | 'suspended';
  isOpen: boolean;
  isAdmin: boolean;
  commissionRate: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Product {
  productId: string;
  shopId: string;
  name: string;
  category: 'vegetables' | 'groceries' | 'dairy' | 'snacks' | 'other';
  description?: string;
  price: number;
  unit: 'kg' | 'piece' | 'packet' | 'liter';
  offerPrice?: number;
  offerText?: string;
  imageUrl?: string;
  inStock: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'packed' | 'out_for_delivery' | 'delivered' | 'rejected';

export interface Order {
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  shopId: string;
  shopName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: 'cod';
  paymentStatus: 'pending' | 'completed';
  status: OrderStatus;
  commissionAmount: number;
  commissionPaid: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  acceptedAt?: Timestamp;
  packedAt?: Timestamp;
  deliveredAt?: Timestamp;
  rejectionReason?: string;
}

export interface Review {
  reviewId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  shopId: string;
  rating: number;
  comment?: string;
  createdAt: Timestamp;
}

export interface CartItem {
  shopId: string;
  shopName: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
}

export interface GroupedProduct {
  name: string;
  category: string;
  shops: Array<{
    shopId: string;
    shopName: string;
    price: number;
    offerPrice?: number;
  }>;
  minPrice: number;
  shopCount: number;
}

export interface DailyStats {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  rating: number;
}

export interface PlatformStats {
  totalOrdersToday: number;
  totalRevenueToday: number;
  activeShops: number;
  totalCustomers: number;
  pendingShops: number;
}
