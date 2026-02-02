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

  // Build product object without undefined values (Firestore rejects undefined)
  const product: Record<string, any> = {
    shopId: data.shopId,
    name: data.name,
    category: data.category,
    price: data.price,
    unit: data.unit,
    inStock: data.inStock,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Only add optional fields if they have values
  if (data.description) product.description = data.description;
  if (data.offerPrice !== undefined && data.offerPrice !== null) product.offerPrice = data.offerPrice;
  if (data.offerText) product.offerText = data.offerText;
  if (imageUrl) product.imageUrl = imageUrl;

  const docRef = await addDoc(collection(db, 'products'), product);
  return docRef.id;
}

export async function updateProduct(
  productId: string,
  data: Partial<CreateProductData>,
  imageFile?: File
): Promise<void> {
  const docRef = doc(db, 'products', productId);

  // Build update object without undefined values
  const updateData: Record<string, any> = {
    updatedAt: Timestamp.now(),
  };

  // Only add defined fields
  if (data.shopId !== undefined) updateData.shopId = data.shopId;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.inStock !== undefined) updateData.inStock = data.inStock;
  if (data.description !== undefined) updateData.description = data.description || '';
  if (data.offerPrice !== undefined) updateData.offerPrice = data.offerPrice || null;
  if (data.offerText !== undefined) updateData.offerText = data.offerText || '';

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
