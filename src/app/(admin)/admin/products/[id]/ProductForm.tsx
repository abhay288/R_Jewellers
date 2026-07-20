"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/shared/validations";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/backend/actions/product.actions";
import ImageUpload from "@/frontend/components/admin/ImageUpload";
import { Loader2, Plus, X } from "lucide-react";

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData: any | null;
  categories: { id: string; name: string }[];
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      category: "",
      subcategory: "",
      brand: "",
      price: 0,
      discount: 0,
      stock: 0,
      sku: "",
      material: "",
      weight: "",
      color: "",
      occasion: "",
      images: [],
      image360: "",
      videoUrl: "",
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      isTrending: false,
      tags: [],
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (initialData?.id) {
        await updateProduct(initialData.id, data);
      } else {
        await createProduct(data);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Failed to save product", error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (e: React.KeyboardEvent | React.MouseEvent, fieldName: 'tags' | 'metaKeywords', input: string, setInput: (v: string) => void) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      e.preventDefault();
      if (input.trim()) {
        const current = form.getValues(fieldName) || [];
        if (!current.includes(input.trim())) {
          form.setValue(fieldName, [...current, input.trim()]);
        }
        setInput("");
      }
    }
  };

  const removeTag = (index: number, fieldName: 'tags' | 'metaKeywords') => {
    const current = form.getValues(fieldName) || [];
    form.setValue(fieldName, current.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 w-full">
      
      {/* 1. Basic Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-playfair font-bold border-b border-border/50 pb-2">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product Name *</label>
            <input 
              {...form.register("name")} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="e.g. 24K Gold Wedding Band"
            />
            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <input 
              {...form.register("slug")} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="auto-generated-if-empty"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category *</label>
            <select 
              {...form.register("category")} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {form.formState.errors.category && <p className="text-xs text-red-500">{form.formState.errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subcategory</label>
            <input 
              {...form.register("subcategory")} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="e.g. Rings"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Description *</label>
            <textarea 
              {...form.register("description")} 
              className="flex min-h-37.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary custom-scrollbar"
              placeholder="Rich description of the product..."
            />
            {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
          </div>
        </div>
      </div>

      {/* 2. Pricing & Inventory */}
      <div className="space-y-6">
        <h2 className="text-xl font-playfair font-bold border-b border-border/50 pb-2">Pricing & Inventory</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Base Price ($) *</label>
            <input 
              type="number"
              step="0.01"
              {...form.register("price", { valueAsNumber: true })} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {form.formState.errors.price && <p className="text-xs text-red-500">{form.formState.errors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Discount (%)</label>
            <input 
              type="number"
              {...form.register("discount", { valueAsNumber: true })} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stock Quantity *</label>
            <input 
              type="number"
              {...form.register("stock", { valueAsNumber: true })} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">SKU</label>
            <input 
              {...form.register("sku")} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* 3. Specifications */}
      <div className="space-y-6">
        <h2 className="text-xl font-playfair font-bold border-b border-border/50 pb-2">Specifications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Brand</label>
            <input {...form.register("brand")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Material</label>
            <input {...form.register("material")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="e.g. 18K Gold" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Weight</label>
            <input {...form.register("weight")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="e.g. 15g" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <input {...form.register("color")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="e.g. Rose Gold" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Occasion</label>
            <input {...form.register("occasion")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="e.g. Wedding" />
          </div>
          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex items-center space-x-2">
              <input 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => addTag(e, 'tags', tagInput, setTagInput)}
                className="flex h-10 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
                placeholder="Press Enter to add tags" 
              />
              <button type="button" onClick={e => addTag(e, 'tags', tagInput, setTagInput)} className="bg-secondary p-2 rounded-lg"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch("tags")?.map((t, i) => (
                <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md flex items-center">
                  {t}
                  <button type="button" onClick={() => removeTag(i, 'tags')} className="ml-1 text-primary hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Media */}
      <div className="space-y-6">
        <h2 className="text-xl font-playfair font-bold border-b border-border/50 pb-2">Media Files</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Product Images *</label>
          <ImageUpload 
            value={form.watch("images") || []} 
            onChange={(urls) => form.setValue("images", urls)}
            onRemove={(url) => form.setValue("images", form.getValues("images")?.filter((u) => u !== url) || [])}
            maxFiles={10}
          />
          {form.formState.errors.images && <p className="text-xs text-red-500">{form.formState.errors.images.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">360° Image URL (Placeholder)</label>
            <input {...form.register("image360")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Video URL (Placeholder)</label>
            <input {...form.register("videoUrl")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
        </div>
      </div>


      {/* 6. Status & Toggles */}
      <div className="space-y-6">
        <h2 className="text-xl font-playfair font-bold border-b border-border/50 pb-2">Visibility & Status</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-border rounded-xl hover:bg-secondary/20 transition-colors">
            <input type="checkbox" {...form.register("isActive")} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-sm font-medium">Active (Published)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-border rounded-xl hover:bg-secondary/20 transition-colors">
            <input type="checkbox" {...form.register("isFeatured")} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-sm font-medium">Featured</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-border rounded-xl hover:bg-secondary/20 transition-colors">
            <input type="checkbox" {...form.register("isBestSeller")} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-sm font-medium">Best Seller</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-border rounded-xl hover:bg-secondary/20 transition-colors">
            <input type="checkbox" {...form.register("isTrending")} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-sm font-medium">Trending</span>
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-border/50 flex justify-end">
        <button 
          disabled={loading}
          type="submit"
          className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-12 py-2 px-10 shadow-md shadow-primary/20"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData?.id ? "Save Product" : "Create Product"}
        </button>
      </div>

    </form>
  );
}
