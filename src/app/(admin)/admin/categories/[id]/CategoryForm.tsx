"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "@/shared/validations";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "@/backend/actions/category.actions";
import ImageUpload from "@/frontend/components/admin/ImageUpload";
import { Loader2 } from "lucide-react";

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData: any | null;
  parentCategories?: { id: string; name: string; level: number }[];
}

export function CategoryForm({ initialData, parentCategories = [] }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      isActive: true,
      bannerImage: "",
      icon: "",
      color: "#000000",
      parentCategory: "",
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);
      
      const formattedData = { ...data };

      if (initialData) {
        await updateCategory(initialData.id, formattedData);
      } else {
        await createCategory(formattedData);
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Failed to save category", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category Name</label>
          <input 
            {...form.register("name")} 
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g. Necklaces"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Slug (Optional)</label>
          <input 
            {...form.register("slug")} 
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="auto-generated if left empty"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Parent Category</label>
          <select 
            {...form.register("parentCategory")}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">None (Top Level Category)</option>
            {parentCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {"—".repeat(cat.level)} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category Color</label>
          <div className="flex items-center space-x-2">
            <input 
              type="color"
              {...form.register("color")} 
              className="h-10 w-14 rounded-md border border-border cursor-pointer"
            />
            <input 
              type="text"
              {...form.register("color")}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea 
            {...form.register("description")} 
            className="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 custom-scrollbar"
            placeholder="Describe the category..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Banner Image (Optional)</label>
          <ImageUpload 
            value={form.watch("bannerImage") ? [form.watch("bannerImage") as string] : []} 
            onChange={(urls) => form.setValue("bannerImage", urls[0] || "")}
            onRemove={() => form.setValue("bannerImage", "")}
            maxFiles={1}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Category Icon (Optional)</label>
          <ImageUpload 
            value={form.watch("icon") ? [form.watch("icon") as string] : []} 
            onChange={(urls) => form.setValue("icon", urls[0] || "")}
            onRemove={() => form.setValue("icon", "")}
            maxFiles={1}
          />
        </div>
      </div>


      <div className="flex items-center space-x-2 border border-border rounded-xl p-4 bg-secondary/20">
        <input 
          type="checkbox"
          id="isActive"
          {...form.register("isActive")}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="isActive" className="text-sm font-medium leading-none">
          Category is Active
        </label>
      </div>

      <button 
        disabled={loading}
        type="submit"
        className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-8 shadow-md shadow-primary/20"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Save Changes" : "Create Category"}
      </button>
    </form>
  );
}
