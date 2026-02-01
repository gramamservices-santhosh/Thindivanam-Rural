import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Product } from '@/types';

export async function getShopProducts(shopId: string): Promise<Product[]> {
  const q = query(
    collection(db, 'products'),
    where('shopId', '==', shopId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), productId: doc.id } as Product));
}

export async function getProductById(productId: string): Promise<Product | null> {
  const docRef = doc(db, 'products', productId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), productId: docSnap.id } as Product;
  }
  return null;
}

export interface CreateProductData {
  shopId: string;
  name: string;
  category: Product['category'];
  description?: string;
  price: number;
  unit: Product['unit'];
  offerPrice?: number;
  offerText?: string;
  inStock: boolean;
}

export async function createProduct(data: CreateProductData, imageFile?: File): Promise<string> {
  let imageUrl: string | undefined;

  // Upload image if provided
  if (imageFile) {
    const imageRef = ref(storage, `products/${data.shopId}/${Date.now()}_${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    imageUrl = await getDownloadURL(imageRef);
  }

  const product = {
    ...data,
    imageUrl,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, 'products'), product);
  return docRef.id;
}

export async function updateProduct(
  productId: string,
  data: Partial<CreateProductData>,
  imageFile?: File
): Promise<void> {
  const docRef = doc(db, 'products', productId);

  let updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  // Upload new image if provided
  if (imageFile) {
    const product = await getProductById(productId);
    if (product?.imageUrl) {
      // Delete old image
      try {
        const oldImageRef = ref(storage, product.imageUrl);
        await deleteObject(oldImageRef);
      } catch (e) {
        console.log('Could not delete old image');
      }
    }

    const imageRef = ref(storage, `products/${data.shopId || 'unknown'}/${Date.now()}_${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    updateData.imageUrl = await getDownloadURL(imageRef);
  }

  await updateDoc(docRef, updateData);
}

export async function deleteProduct(productId: string): Promise<void> {
  const product = await getProductById(productId);

  // Delete image from storage
  if (product?.imageUrl) {
    try {
      const imageRef = ref(storage, product.imageUrl);
      await deleteObject(imageRef);
    } catch (e) {
      console.log('Could not delete image');
    }
  }

  await deleteDoc(doc(db, 'products', productId));
}

export async function toggleProductStock(productId: string, inStock: boolean): Promise<void> {
  const docRef = doc(db, 'products', productId);
  await updateDoc(docRef, {
    inStock,
    updatedAt: Timestamp.now(),
  });
}
