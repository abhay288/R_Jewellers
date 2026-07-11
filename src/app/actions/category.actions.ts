"use server";

import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { revalidatePath } from "next/cache";
import { ActivityLogService } from "@/services/ActivityLogService";
import { auth } from "@/auth";

const activityLogService = new ActivityLogService();

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createCategory(data: any) {
  try {
    const session = await requireAdmin();
    await connectDB();
    
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    const category = await Category.create(data);
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await activityLogService.logAction(
      "Category Created",
      "Category",
      category._id,
      session.user.id,
      { categoryName: category.name }
    );
    
    revalidatePath("/admin/categories");
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCategory(id: string, data: any) {
  try {
    const session = await requireAdmin();
    await connectDB();
    
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) throw new Error("Category not found");
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await activityLogService.logAction(
      "Category Updated",
      "Category",
      category._id,
      session.user.id,
      { categoryName: category.name }
    );
    
    revalidatePath("/admin/categories");
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    const session = await requireAdmin();
    await connectDB();
    
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new Error("Category not found");
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await activityLogService.logAction(
      "Category Deleted",
      "Category",
      category._id,
      session.user.id,
      { categoryName: category.name }
    );
    
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
