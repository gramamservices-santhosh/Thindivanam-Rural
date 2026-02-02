'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Package, Edit, Trash2, ToggleLeft, ToggleRight, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import { getShopProducts, deleteProduct, toggleProductStock, createProduct, updateProduct, CreateProductData } from '@/lib/firestore/products';
import { Product } from '@/types';

const categoryIcons: Record<string, string> = {
  vegetables: '🥬',
  groceries: '🛒',
  dairy: '🥛',
  snacks: '🍪',
  other: '📦',
};

const categories = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'other', label: 'Other' },
];

const units = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'piece', label: 'Piece' },
  { value: 'packet', label: 'Packet' },
  { value: 'liter', label: 'Liter' },
];

export default function ProductsPage() {
  const router = useRouter();
  const { user, shopData, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<CreateProductData>>({
    name: '',
    category: 'vegetables',
    description: '',
    price: 0,
    unit: 'kg',
    offerPrice: undefined,
    offerText: '',
    inStock: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const fetchProducts = async () => {
    if (!shopData?.shopId) return;
    setLoading(true);
    try {
      const result = await getShopProducts(shopData.shopId);
      setProducts(result);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopData?.shopId) {
      fetchProducts();
    }
  }, [shopData?.shopId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'vegetables',
      description: '',
      price: 0,
      unit: 'kg',
      offerPrice: undefined,
      offerText: '',
      inStock: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || '',
      price: product.price,
      unit: product.unit,
      offerPrice: product.offerPrice,
      offerText: product.offerText || '',
      inStock: product.inStock,
    });
    setImagePreview(product.imageUrl || null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopData?.shopId || !formData.name || !formData.price) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data: CreateProductData = {
        shopId: shopData.shopId,
        name: formData.name!,
        category: formData.category as Product['category'],
        description: formData.description,
        price: Number(formData.price),
        unit: formData.unit as Product['unit'],
        offerPrice: formData.offerPrice ? Number(formData.offerPrice) : undefined,
        offerText: formData.offerText,
        inStock: formData.inStock ?? true,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.productId, data, imageFile || undefined);
        showToast('Product updated!', 'success');
      } else {
        await createProduct(data, imageFile || undefined);
        showToast('Product added!', 'success');
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Failed to save product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      showToast('Product deleted', 'success');
      setDeleteConfirm(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Failed to delete product', 'error');
    }
  };

  const handleToggleStock = async (product: Product) => {
    try {
      await toggleProductStock(product.productId, !product.inStock);
      showToast(`Product marked as ${product.inStock ? 'out of stock' : 'in stock'}`, 'success');
      fetchProducts();
    } catch (error) {
      console.error('Error toggling stock:', error);
      showToast('Failed to update stock', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!user || !shopData) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-shop px-4 pt-4 pb-6 rounded-b-[30px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-white text-xl font-bold flex-1">Products</h1>
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
            {products.length} items
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 card-shadow animate-pulse">
                <div className="w-full h-24 bg-gray-200 rounded-xl mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <div key={product.productId} className="bg-white rounded-2xl p-3 card-shadow">
                <div className="relative">
                  <div className="w-full h-24 rounded-xl bg-gray-100 flex items-center justify-center text-4xl mb-2">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      categoryIcons[product.category] || '📦'
                    )}
                  </div>
                  <span
                    className={`absolute top-1 right-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {product.inStock ? 'In Stock' : 'Out'}
                  </span>
                </div>

                <h3 className="font-medium text-gray-800 text-sm truncate">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <span className="font-bold text-green-600">₹{product.offerPrice || product.price}</span>
                  <span className="text-xs text-gray-500">/{product.unit}</span>
                  {product.offerPrice && (
                    <span className="text-xs text-gray-400 line-through ml-1">₹{product.price}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleStock(product)}
                    className={`flex-1 p-2 rounded-lg ${
                      product.inStock ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {product.inStock ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 p-2 rounded-lg bg-blue-100 text-blue-600"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.productId)}
                    className="flex-1 p-2 rounded-lg bg-red-100 text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Package size={48} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No products yet</h2>
            <p className="text-gray-500 mb-6">Add your first product to start selling</p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={openAddModal}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full gradient-shop shadow-lg flex items-center justify-center text-white"
      >
        <Plus size={28} />
      </button>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Fresh Tomatoes"
                  className="input-field"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="form-label">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value as any }))}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, price: Number(e.target.value) }))}
                    placeholder="40"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData((p) => ({ ...p, unit: e.target.value as any }))}
                    className="input-field"
                  >
                    {units.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Offer Price & Text */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={formData.offerPrice || ''}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        offerPrice: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    placeholder="35"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="form-label">Offer Text</label>
                  <input
                    type="text"
                    value={formData.offerText}
                    onChange={(e) => setFormData((p) => ({ ...p, offerText: e.target.value }))}
                    placeholder="10% OFF"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Fresh from farm..."
                  rows={2}
                  className="input-field resize-none"
                  style={{ height: 'auto', minHeight: '80px' }}
                />
              </div>

              {/* Image */}
              <div>
                <label className="form-label">Product Image</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-300" />
                    </div>
                  )}
                  <label className="px-5 py-3 bg-orange-500 text-white font-semibold rounded-xl cursor-pointer hover:bg-orange-600 transition-colors">
                    Upload Image
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-700">In Stock</span>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, inStock: !p.inStock }))}
                  className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${
                    formData.inStock ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      formData.inStock ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-50">
                  {submitting ? 'Saving...' : editingProduct ? 'Update' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Product?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
