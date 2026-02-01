import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shop } from '@/types';

export async function getActiveShops(): Promise<Shop[]> {
  const q = query(
    collection(db, 'shops'),
    where('status', '==', 'active'),
    where('isOpen', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), shopId: doc.id } as Shop));
}

export async function getShopById(shopId: string): Promise<Shop | null> {
  const docRef = doc(db, 'shops', shopId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), shopId: docSnap.id } as Shop;
  }
  return null;
}

export async function getShopsByIds(shopIds: string[]): Promise<Map<string, Shop>> {
  const shops = new Map<string, Shop>();

  // Fetch shops in parallel
  const promises = shopIds.map(async (shopId) => {
    const shop = await getShopById(shopId);
    if (shop) {
      shops.set(shopId, shop);
    }
  });

  await Promise.all(promises);
  return shops;
}

export async function getShopsByCategory(category: string): Promise<Shop[]> {
  const q = query(
    collection(db, 'shops'),
    where('status', '==', 'active'),
    where('isOpen', '==', true),
    where('category', '==', category)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), shopId: doc.id } as Shop));
}

export interface ShopWithProduct {
  shop: Shop;
  price: number;
  offerPrice?: number;
  productId: string;
}

export async function getShopsSellingProduct(productName: string): Promise<ShopWithProduct[]> {
  // First, get all products with this name
  const productsQuery = query(
    collection(db, 'products'),
    where('inStock', '==', true)
  );
  const productsSnapshot = await getDocs(productsQuery);
  const products = productsSnapshot.docs
    .map((doc) => ({ ...doc.data(), productId: doc.id }))
    .filter((p: any) => p.name.toLowerCase() === productName.toLowerCase());

  if (products.length === 0) {
    return [];
  }

  // Get unique shop IDs
  const shopIds = [...new Set(products.map((p: any) => p.shopId))];

  // Fetch all shops
  const shopsMap = await getShopsByIds(shopIds);

  // Combine shop and product info
  const result: ShopWithProduct[] = [];

  for (const product of products) {
    const shop = shopsMap.get((product as any).shopId);
    if (shop && shop.status === 'active' && shop.isOpen) {
      result.push({
        shop,
        price: (product as any).price,
        offerPrice: (product as any).offerPrice,
        productId: (product as any).productId,
      });
    }
  }

  // Sort by price (lowest first)
  return result.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
}
