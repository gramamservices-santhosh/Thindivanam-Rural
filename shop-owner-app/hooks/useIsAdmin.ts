'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export function useIsAdmin() {
  const { shopData, loading: authLoading } = useAuth();
  const [isAdminAccount, setIsAdminAccount] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is a dedicated admin (from admins collection)
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          setIsAdminAccount(adminDoc.exists());
        } catch (error) {
          setIsAdminAccount(false);
        }
      } else {
        setIsAdminAccount(false);
      }
      setCheckingAdmin(false);
    });

    return () => unsubscribe();
  }, []);

  // Is admin if:
  // 1. Has dedicated admin account (admins collection), OR
  // 2. Is a shop owner with isAdmin flag
  const isAdmin = isAdminAccount || shopData?.isAdmin === true;
  const loading = authLoading || checkingAdmin;

  return { isAdmin, loading, isAdminAccount };
}
