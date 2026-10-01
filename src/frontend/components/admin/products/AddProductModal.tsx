'use client';

import React, { useState } from 'react';
import { X, Loader2, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { createProduct } from '@/backend/actions/product.actions';
import ImageUpload from '@/frontend/components/admin/ImageUpload';
import RichTextEditor from '@/frontend/components/admin/RichTextEditor';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
  onSuccess?: () => void;
}

export default function AddProductModal({ isOpen, onClose, categories, onSuccess }: AddProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stock, setStock] = useState('10');
  const [brand, setBrand] = useState('Radhika Jewellers');
  const [collectionName, setCollectionName] = useState('');
  
  // Category logic: existing dropdown vs custom text input
  const [isCustomCategory, setIsCustomCategory] = useState(categories.length === 0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  // Descriptions & Media
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  // Toggles
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage("Please enter a valid non-negative price.");
      return;
    }

    const categoryValue = isCustomCategory ? customCategory.trim() : selectedCategory;
    if (!categoryValue) {
      setErrorMessage("Please select or enter a category.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim() || undefined,
        price: numPrice,
        mrp: mrp ? parseFloat(mrp) : Math.round(numPrice * 1.3),
        stock: parseInt(stock || '10', 10),
        category: categoryValue,
        brand: brand.trim() || 'Radhika Jewellers',
        collectionName: collectionName.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || `<p>${name} designed by ${brand}.</p>`,
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800"],
        isActive,
        isFeatured,
        isTrending,
        isNewArrival,
        status: parseInt(stock, 10) > 0 ? 'Published' : 'Out Of Stock',
      };

      const res = await createProduct(payload);

      if (!res.success) {
        throw new Error(res.error || "Failed to create product");
      }

      if (onSuccess) onSuccess();
      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error("AddProductModal error:", err);
      setErrorMessage(err.message || "An unexpected error occurred while saving product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-2xl font-playfair font-bold text-foreground">Add New Product</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Quickly list a new luxury item in your Radhika Jewellers catalog.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive text-destructive text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Kundan Bridal Necklace Set"
                className="w-full p-3 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Field */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Category *</label>
                {categories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    {isCustomCategory ? "← Choose existing category" : "+ Add new category manually"}
                  </button>
                )}
              </div>

              {!isCustomCategory && categories.length > 0 ? (
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setIsCustomCategory(true);
                    } else {
                      setSelectedCategory(e.target.value);
                    }
                  }}
                  className="w-full p-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="__custom__">+ Type Custom Category Name...</option>
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter category (e.g. Necklaces, Earrings, Bangles, Rings)..."
                  className="w-full p-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="45000"
                className="w-full p-3 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">MRP Price (₹)</label>
              <input
                type="number"
                min="0"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder="60000"
                className="w-full p-3 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Stock Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full p-3 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">SKU (Auto if empty)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="RJ-KUN-9012"
                className="w-full p-3 bg-card border border-border rounded-xl text-sm font-mono text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Short Description</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Designer Kundan choker set featuring multi-layer gold polish."
                className="w-full p-3 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Full Description (Rich Text)</label>
              <RichTextEditor
                content={description}
                onChange={(html) => setDescription(html)}
              />
            </div>
          </div>

          {/* Images Upload */}
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Product Images (Cloudinary)</label>
            <ImageUpload
              value={images}
              onChange={(urls) => setImages(urls)}
              onRemove={(url) => setImages(prev => prev.filter(u => u !== url))}
              maxFiles={6}
            />
          </div>

          {/* Visibility Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 border border-border rounded-xl cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-primary" />
              <span className="text-xs font-semibold">Active</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-border rounded-xl cursor-pointer">
              <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="accent-primary" />
              <span className="text-xs font-semibold">New Arrival</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-border rounded-xl cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-primary" />
              <span className="text-xs font-semibold">Featured</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-border rounded-xl cursor-pointer">
              <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} className="accent-primary" />
              <span className="text-xs font-semibold">Trending</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <a
              href="/admin/products/new"
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Open Full Page Detailed Form →
            </a>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm transition-all shadow-md shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save & Create Product
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
