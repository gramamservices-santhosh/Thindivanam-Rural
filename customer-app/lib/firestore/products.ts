import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, GroupedProduct } from '@/types';

export async function getAllProducts(): Promise<Product[]> {
  const q = query(
    collection(db, 'products'),
    where('inStock', '==', true),
    orderBy('name')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), productId: doc.id } as Product));
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const q = query(
    collection(db, 'products'),
    where('inStock', '==', true),
    where('category', '==', category),
    orderBy('name')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), productId: doc.id } as Product));
}

export async function searchProducts(searchQuery: string): Promise<Product[]> {
  // Get all in-stock products and filter client-side for case-insensitive search
  const q = query(
    collection(db, 'products'),
    where('inStock', '==', true)
  );
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((doc) => ({ ...doc.data(), productId: doc.id } as Product));

  const lowerQuery = searchQuery.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
  );
}

export async function getGroupedProducts(category?: string): Promise<GroupedProduct[]> {
  let products: Product[];

  if (category && category !== 'all') {
    products = await getProductsByCategory(category);
  } else {
    products = await getAllProducts();
  }

  // Group by product name (case-insensitive)
  const grouped = new Map<string, GroupedProduct>();

  for (const product of products) {
    const key = product.name.toLowerCase();

    if (!grouped.has(key)) {
      grouped.set(key, {
        name: product.name,
        category: product.category,
        shops: [],
        minPrice: product.offerPrice || product.price,
        shopCount: 0,
      });
    }

    const item = grouped.get(key)!;
    item.shops.push({
      shopId: product.shopId,
      shopName: '', // Will be populated when needed
      price: product.price,
      offerPrice: product.offerPrice,
    });
    item.minPrice = Math.min(item.minPrice, product.offerPrice || product.price);
    item.shopCount = item.shops.length;
  }

  return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function searchGroupedProducts(searchQuery: string): Promise<GroupedProduct[]> {
  const products = await searchProducts(searchQuery);

  const grouped = new Map<string, GroupedProduct>();

  for (const product of products) {
    const key = product.name.toLowerCase();

    if (!grouped.has(key)) {
      grouped.set(key, {
        name: product.name,
        category: product.category,
        shops: [],
        minPrice: product.offerPrice || product.price,
        shopCount: 0,
      });
    }

    const item = grouped.get(key)!;
    item.shops.push({
      shopId: product.shopId,
      shopName: '',
      price: product.price,
      offerPrice: product.offerPrice,
    });
    item.minPrice = Math.min(item.minPrice, product.offerPrice || product.price);
    item.shopCount = item.shops.length;
  }

  return Array.from(grouped.values());
}

export async function getProductsByName(productName: string): Promise<Product[]> {
  const q = query(
    collection(db, 'products'),
    where('inStock', '==', true)
  );
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((doc) => ({ ...doc.data(), productId: doc.id } as Product));

  const lowerName = productName.toLowerCase();
  return products.filter((p) => p.name.toLowerCase() === lowerName);
}

export async function getProductById(productId: string): Promise<Product | null> {
  const docRef = doc(db, 'products', productId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), productId: docSnap.id } as Product;
  }
  return null;
}

export async function getProductsByShop(shopId: string): Promise<Product[]> {
  const q = query(
    collection(db, 'products'),
    where('shopId', '==', shopId),
    where('inStock', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), productId: doc.id } as Product));
}
