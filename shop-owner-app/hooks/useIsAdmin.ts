'use client';

import { useAuth } from './useAuth';

export function useIsAdmin() {
  const { shopData, loading } = useAuth();

  return {
    isAdmin: shopData?.isAdmin === true,
    loading,
  };
}
