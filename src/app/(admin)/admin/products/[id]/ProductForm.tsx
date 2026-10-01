"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/shared/validations";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/backend/actions/product.actions";
import ImageUpload from "@/frontend/components/admin/ImageUpload";
import RichTextEditor from "@/frontend/components/admin/RichTextEditor";
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

  const initialCatIsCustom = initialData?.category ? !categories.some(c => c.id === initialData.category) : false;
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(categories.length === 0 || initialCatIsCustom);
  const [customCategoryInput, setCustomCategoryInput] = useState<string>(initialCatIsCustom ? initialData.category : "");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData || {
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      category: "",
      subcategory: "",
      collectionName: "",
      brand: "Radhika Jewellers",
      price: 0,
      mrp: 0,
      discount: 0,
      stock: 10,
      sku: "",
      material: "Brass Alloy with Gold Plating",
      stone: "Kundan & CZ Gemstones",
      weight: "",
      dimensions: "",
      color: "Gold",
      gender: "Women",
      occasion: "Bridal & Festive",
      style: "Traditional Royal",
      images: [],
      image360: "",
      videoUrl: "",
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      isTrending: false,
      isNewArrival: true,
      tags: [],
      careInstructions: "Keep away from moisture, perfumes, and harsh chemicals. Store in a soft velvet container after use.",
      shippingInfo: "Dispatched within 24-48 hours. Free insured pan-India delivery.",
      returnPolicy: "Easy 48-hour return and replacement policy for damaged or defective items.",
      warranty: "6-Month Warranty on Gold Plating & Kundan Settings.",
      seoTitle: "",
      seoDescription: "",
      metaKeywords: [],
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      if (isCustomCategory) {
        if (!customCategoryInput.trim()) {
          form.setError("category", { message: "Please enter a category name" });
          setLoading(false);
          return;
        }
        data.category = customCategoryInput.trim();
      }

      if (initialData?.id) {
        const res = await updateProduct(initialData.id, data);
        if (res && !res.success) throw new Error(res.error || "Failed to update product");
      } else {
        const res = await createProduct(data);
        if (res && !res.success) throw new Error(res.error || "Failed to create product");
      }
      window.location.href = "/admin/products";
    } catch (error: any) {
      console.error("Failed to save product", error);
      alert(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    const firstErrorKey = Object.keys(errors)[0];
    const firstError = errors[firstErrorKey];
    if (firstError?.message) {
      alert(`Validation Error [${firstErrorKey}]: ${firstError.message}`);
    } else {
      alert("Please fill in all required fields before creating the product.");
    }
  };

  const addTag = (
    e: React.KeyboardEvent | React.MouseEvent,
    fieldName: 'tags' | 'metaKeywords',
    input: string,
    setInput: (v: string) => void
  ) => {
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
    <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-10 w-full pb-16">
      
      {/* 1. Basic Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-playfair font-bold border-b border-border/50 pb-2">1. Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product Name *</label>
            <input 
              {...form.register("name")} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="e.g. Royal Kundan Necklace Set"
            />
            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">SEO Slug (Auto-generated if empty)</label>
            <input 
              {...form.register("slug")} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="e.g. royal-kundan-necklace-set"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Category *</label>
              {categories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  {isCustomCategory ? "← Select from created categories" : "+ Add new category manually"}
                </button>
              )}
            </div>

            {!isCustomCategory && categories.length > 0 ? (
              <select 
                {...form.register("category")} 
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsCustomCategory(true);
                  } else {
                    form.setValue("category", e.target.value, { shouldValidate: true });
                  }
                }}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="" disabled>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
                <option value="__custom__">+ Type New Custom Category...</option>
              </select>
            ) : (
              <input 
                type="text"
                value={customCategoryInput}
                onChange={(e) => {
                  setCustomCategoryInput(e.target.value);
                  form.setValue("category", e.target.value, { shouldValidate: true });
                }}
                placeholder="Type category name (e.g. Necklaces, Earrings, Bangles, Rings)..."
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-medium"
              />
            )}
            {form.formState.errors.category && <p className="text-xs text-red-500">{form.formState.errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subcategory</label>
            <input 
              {...form.register("subcategory")} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="e.g. Chokers / Drop Earrings"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Collection Name</label>
            <input 
              {...form.register("collectionName")} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="e.g. Bridal Heritage, Royal Solitaire"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Brand Name</label>
            <input 
              {...form.register("brand")} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Radhika Jewellers"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Short Highlight Tagline</label>
            <input 
              {...form.register("shortDescription")} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="e.g. Designer Kundan choker set featuring multi-layer gold polish."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium block mb-1">Full Description (Rich Text Editor with Tables, Links & Formatting) *</label>
            <RichTextEditor
              content={form.watch("description") || ""}
              onChange={(html) => form.setValue("description", html, { shouldValidate: true })}
            />
            {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
          </div>
        </div>
      </div>

      {/* 2. Pricing & Inventory */}
      <div className="space-y-6">
        <h2 className="text-xl font-playfair font-bold border-b border-border/50 pb-2">2. Pricing & Inventory</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Selling Price (₹) *</label>
            <input 
              type="number"
              step="1"
              {...form.register("price", { valueAsNumber: true })} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {form.formState.errors.price && <p className="text-xs text-red-500">{form.formState.errors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">MRP (₹)</label>
            <input 
              type="number"
              step="1"
              {...form.register("mrp", { valueAsNumber: true })} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Original price before discount"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Discount (%)</label>
            <input 
              type="number"
              {...form.register("discount", { valueAsNumber: true })} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="e.g. 20"
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

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">SKU (Auto-generated if empty)</label>
            <input 
              {...form.register("sku")} 
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="e.g. RJ-KUN-8492"
            />
          </div>
        </div>
      </div>

      {/* 3. Material & Physical Specifications */}
      <div className="space-y-6">
        <h2 className="text-xl font-playfair font-bold border-b border-border/50 pb-2">3. Product Specifications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Base Material</label>
            <input {...form.register("material")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="e.g. Brass Alloy with Gold Polish" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stone / Gemstone</label>
            <input {...form.register("stone")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="e.g. Kundan & CZ Gemstones" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color / Polish</label>
            <input {...form.register("color")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="e.g. 24K Gold / Rose Gold" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Weight (g)</label>
            <input {...form.register("weight")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="e.g. 38g" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Dimensions / Size</label>
            <input {...form.register("dimensions")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="e.g. Adjustable / 16 inch" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Gender</label>
            <select {...form.register("gender")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
              <option value="Men">Men</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Occasion</label>
            <input {...form.register("occasion")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="e.g. Bridal, Festive, Wedding" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Design Style</label>
            <input {...form.register("style")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="e.g. Traditional Royal, Minimalist" />
          </div>

          <div className="space-y-2 md:col-span-4">
            <label className="text-sm font-medium">Product Search Tags</label>
            <div className="flex items-center space-x-2">
              <input 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => addTag(e, 'tags', tagInput, setTagInput)}
                className="flex h-10 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
                placeholder="Type tag and press Enter" 
              />
              <button type="button" onClick={e => addTag(e, 'tags', tagInput, setTagInput)} className="bg-secondary p-2.5 rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch("tags")?.map((t, i) => (
                <span key={i} className="bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs px-2.5 py-1 rounded-full flex items-center font-medium">
                  {t}
                  <button type="button" onClick={() => removeTag(i, 'tags')} className="ml-1.5 text-amber-500 hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Policies & Warranty Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-playfair font-bold border-b border-border/50 pb-2">4. Policies, Care & Warranty</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Care & Handling Instructions</label>
            <textarea {...form.register("careInstructions")} rows={2} className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Warranty Details</label>
            <textarea {...form.register("warranty")} rows={2} className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Shipping & Delivery Info</label>
            <textarea {...form.register("shippingInfo")} rows={2} className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Return Policy Info</label>
            <textarea {...form.register("returnPolicy")} rows={2} className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
        </div>
      </div>

      {/* 5. Media Upload */}
      <div className="space-y-6">
        <h2 className="text-xl font-playfair font-bold border-b border-border/50 pb-2">5. Media Files</h2>
        
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
            <label className="text-sm font-medium">Video URL (mp4 / Cloudinary)</label>
            <input {...form.register("videoUrl")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="https://res.cloudinary.com/..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">360° Image View URL</label>
            <input {...form.register("image360")} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
          </div>
        </div>
      </div>

      {/* 6. Visibility & Badges */}
      <div className="space-y-6">
        <h2 className="text-xl font-playfair font-bold border-b border-border/50 pb-2">6. Badges & Status</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-border rounded-xl hover:bg-secondary/20 transition-colors">
            <input type="checkbox" {...form.register("isActive")} className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-xs font-semibold">Active</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-border rounded-xl hover:bg-secondary/20 transition-colors">
            <input type="checkbox" {...form.register("isNewArrival")} className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-xs font-semibold">New Arrival</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-border rounded-xl hover:bg-secondary/20 transition-colors">
            <input type="checkbox" {...form.register("isFeatured")} className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-xs font-semibold">Featured</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-border rounded-xl hover:bg-secondary/20 transition-colors">
            <input type="checkbox" {...form.register("isBestSeller")} className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-xs font-semibold">Best Seller</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 border border-border rounded-xl hover:bg-secondary/20 transition-colors">
            <input type="checkbox" {...form.register("isTrending")} className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            <span className="text-xs font-semibold">Trending</span>
          </label>
        </div>
      </div>

      {/* Save / Create Action */}
      <div className="pt-6 border-t border-border/50 flex justify-end">
        <button 
          disabled={loading}
          type="submit"
          className="inline-flex items-center justify-center rounded-xl text-sm font-bold uppercase tracking-wider transition-colors bg-amber-500 text-black hover:bg-amber-400 h-12 py-2 px-10 shadow-md shadow-amber-500/20 cursor-pointer"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData?.id ? "Save Product Changes" : "Create Product Listing"}
        </button>
      </div>

    </form>
  );
}
