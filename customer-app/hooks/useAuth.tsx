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
import { User, Address } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  name: string;
  phone: string;
  email?: string;
  password: string;
  address: string;
  landmark?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as User);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (phone: string, password: string) => {
    // Use phone as email for Firebase Auth (phone@namtindivanam.app)
    const email = `${phone}@namtindivanam.app`;
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (data: RegisterData) => {
    const email = `${data.phone}@namtindivanam.app`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);

    const defaultAddress: Address = {
      id: 'addr1',
      address: data.address,
      isDefault: true,
      ...(data.landmark && { landmark: data.landmark }),
    };

    const newUser: User = {
      userId: userCredential.user.uid,
      name: data.name,
      phone: data.phone,
      addresses: [defaultAddress],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...(data.email && { email: data.email }),
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    setUserData(newUser);
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  const updateUserData = async (data: Partial<User>) => {
    if (!user) return;
    const updatedData = { ...data, updatedAt: Timestamp.now() };
    await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });
    setUserData((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, register, logout, updateUserData }}>
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
