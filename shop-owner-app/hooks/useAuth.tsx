'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Shop, BusinessHours } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  shopData: Shop | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterShopData) => Promise<void>;
  logout: () => Promise<void>;
  updateShopData: (data: Partial<Shop>) => Promise<void>;
  refreshShopData: () => Promise<void>;
}

interface RegisterShopData {
  shopName: string;
  ownerName: string;
  phone: string;
  email?: string;
  password: string;
  address: string;
  category: Shop['category'];
  deliveryCharge: number;
  deliveryRadius: number;
  businessHours: BusinessHours;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [shopData, setShopData] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchShopData = async (userId: string) => {
    try {
      const shopDoc = await getDoc(doc(db, 'shops', userId));
      if (shopDoc.exists()) {
        setShopData({ ...shopDoc.data(), shopId: shopDoc.id } as Shop);
      } else {
        setShopData(null);
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
      setShopData(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          await fetchShopData(firebaseUser.uid);
        } else {
          setShopData(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (phone: string, password: string) => {
    const email = `shop_${phone}@namtindivanam.app`;
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (data: RegisterShopData) => {
    const email = `shop_${data.phone}@namtindivanam.app`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);

    const newShop: Shop = {
      shopId: userCredential.user.uid,
      ownerId: userCredential.user.uid,
      shopName: data.shopName,
      ownerName: data.ownerName,
      phone: data.phone,
      ...(data.email ? { email: data.email } : {}),
      address: data.address,
      category: data.category,
      deliveryCharge: data.deliveryCharge,
      deliveryRadius: Math.min(data.deliveryRadius, 10), // Max 10 km
      businessHours: data.businessHours,
      rating: 0,
      totalReviews: 0,
      totalOrders: 0,
      status: 'pending', // Needs admin approval
      isOpen: false,
      isAdmin: false,
      commissionRate: 10, // Default 10%
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'shops', userCredential.user.uid), newShop);
    setShopData(newShop);
  };

  const logout = async () => {
    await signOut(auth);
    setShopData(null);
  };

  const updateShopData = async (data: Partial<Shop>) => {
    if (!user) return;
    const updatedData = { ...data, updatedAt: Timestamp.now() };
    await setDoc(doc(db, 'shops', user.uid), updatedData, { merge: true });
    setShopData((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  const refreshShopData = async () => {
    if (user) {
      await fetchShopData(user.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, shopData, loading, login, register, logout, updateShopData, refreshShopData }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
