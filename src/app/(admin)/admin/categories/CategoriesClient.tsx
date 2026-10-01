'use client';

import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import ImageUpload from '@/frontend/components/admin/ImageUpload';
import Image from 'next/image';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerImage: string;
  icon: string;
  color: string;
  isActive: boolean;
  isFeatured: boolean;
  parentCategory: { id: string; name: string } | null;
  level: number;
  productCount: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

interface CategoriesClientProps {
  initialCategories: CategoryItem[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState('none');
  const [bannerImage, setBannerImage] = useState('');
  const [icon, setIcon] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  const openAddModal = (parentId?: string) => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setParentCategory(parentId || 'none');
    setBannerImage('');
    setIcon('');
    setIsActive(true);
    setIsFeatured(false);
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setShowModal(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setParentCategory(cat.parentCategory?.id || 'none');
    setBannerImage(cat.bannerImage || '');
    setIcon(cat.icon || '');
    setIsActive(cat.isActive);
    setIsFeatured(cat.isFeatured);
    setSeoTitle(cat.seoTitle || '');
    setSeoDescription(cat.seoDescription || '');
    setSeoKeywords(cat.seoKeywords?.join(', ') || '');
    setShowModal(true);
  };

  const handleSaveCategory = async () => {
    if (!name.trim()) return alert("Category name is required.");
    setIsSubmitting(true);

    const payload = {
      id: editingCategory?.id,
      name,
      slug,
      description,
      parentCategory,
      bannerImage,
      icon,
      isActive,
      isFeatured,
      seoTitle,
      seoDescription,
      seoKeywords,
    };

    try {
      const res = await fetch('/api/admin/categories', {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save category');

      // Refresh Categories list
      const listRes = await fetch('/api/admin/categories');
      const listJson = await listRes.json();
      if (listJson.success) setCategories(listJson.categories);

      setShowModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete category');

      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Group Categories by Parent (Root vs Children)
  const rootCategories = categories.filter(c => !c.parentCategory && c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const getSubcategories = (parentId: string) => categories.filter(c => c.parentCategory?.id === parentId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="relative overflow-hidden bg-card border border-border/60 p-6 md:p-8 rounded-3xl shadow-sm transition-all duration-300">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400">Hierarchy & Taxonomy</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-playfair font-bold text-foreground mt-1">Category Manager</h1>
            <p className="text-muted-foreground mt-1 text-xs lg:text-sm max-w-2xl leading-relaxed">
              Organize multi-tier parent & sub-categories, Cloudinary banners, icons, and SEO metadata.
            </p>
          </div>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-2 bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 font-black px-6 py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 cursor-pointer border border-amber-300/60 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-3" />
            + Add Root Category
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-card border border-border rounded-xl px-4 py-2 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground mr-2" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-sm w-full text-foreground"
        />
      </div>

      {/* Tree Hierarchy Grid */}
      <div className="space-y-4">
        {rootCategories.length > 0 ? (
          rootCategories.map((root) => {
            const subs = getSubcategories(root.id);
            return (
              <div key={root.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/40 transition-colors">
                {/* Parent Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                      {root.icon ? (
                        <Image src={root.icon} fill alt={root.name} className="object-cover" />
                      ) : (
                        <Folder className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">{root.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold">
                          {root.productCount} Products
                        </span>
                        {root.isFeatured && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 text-[10px] font-bold flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3" /> Featured
                          </span>
                        )}
                        {!root.isActive && (
                          <span className="px-2 py-0.5 rounded bg-destructive/15 text-destructive text-[10px] font-bold">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        /category/{root.slug} • {subs.length} Subcategories
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAddModal(root.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-semibold border border-border transition-colors cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-primary" />
                      Add Child Subcategory
                    </button>
                    <button
                      onClick={() => openEditModal(root)}
                      className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(root.id, root.name)}
                      className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {subs.length > 0 && (
                  <div className="pl-6 border-l-2 border-primary/20 space-y-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {subs.map((child) => (
                      <div key={child.id} className="p-3 bg-muted/30 border border-border rounded-xl flex items-center justify-between gap-3 hover:bg-muted/60 transition-colors">
                        <div className="flex items-center gap-2 truncate">
                          <Layers className="w-4 h-4 text-primary shrink-0" />
                          <div className="truncate">
                            <span className="text-sm font-semibold text-foreground truncate block">{child.name}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">{child.productCount} Items</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditModal(child)}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(child.id, child.name)}
                            className="p-1.5 text-muted-foreground hover:text-destructive rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center bg-card border border-border rounded-2xl">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-base font-semibold text-foreground">No Categories Found</h3>
            <p className="text-xs text-muted-foreground">Create root categories or subcategories to organize products.</p>
          </div>
        )}
      </div>

      {/* ADD / EDIT CATEGORY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 p-6 shrink-0 bg-secondary/30">
              <h3 className="text-xl font-bold text-foreground">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kundan Necklaces"
                    className="w-full p-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Parent Category</label>
                  <select
                    value={parentCategory}
                    onChange={(e) => setParentCategory(e.target.value)}
                    className="w-full p-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="none">None (Root Level Category)</option>
                    {categories.filter(c => c.id !== editingCategory?.id && !c.parentCategory).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">SEO Slug (Auto-generated if empty)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. kundan-necklaces"
                  className="w-full p-3 bg-card border border-border rounded-xl text-sm font-mono text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Category Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Designer Kundan necklaces styled for royal occasions..."
                  className="w-full p-3 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Cloudinary Banner & Icon Uploader */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Category Icon (Cloudinary)</label>
                  <ImageUpload
                    value={icon ? [icon] : []}
                    onChange={(urls) => setIcon(urls[0] || '')}
                    onRemove={() => setIcon('')}
                    maxFiles={1}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Banner Image (Cloudinary)</label>
                  <ImageUpload
                    value={bannerImage ? [bannerImage] : []}
                    onChange={(urls) => setBannerImage(urls[0] || '')}
                    onRemove={() => setBannerImage('')}
                    maxFiles={1}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="text-xs font-semibold text-foreground">Active Visibility</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="text-xs font-semibold text-foreground">Featured Header Menu</span>
                </label>
              </div>

              {/* SEO Meta */}
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SEO Optimization</h4>
                <input
                  type="text"
                  placeholder="SEO Title Tag"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full p-2.5 bg-card border border-border rounded-lg text-xs text-foreground"
                />
                <textarea
                  rows={2}
                  placeholder="SEO Meta Description"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full p-2.5 bg-card border border-border rounded-lg text-xs text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-border/60 shrink-0 bg-secondary/20">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 flex items-center gap-2 cursor-pointer border border-amber-300/60"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingCategory ? 'Save Category Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
