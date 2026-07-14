"use server";

import connectDB from "@/shared/lib/mongodb";
import Category from "@/backend/models/Category";
import { revalidatePath } from "next/cache";
import { ActivityLogService } from "@/backend/services/ActivityLogService";
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

    // Check for duplicate slug
    const existing = await Category.findOne({ slug: data.slug });
    if (existing) {
      throw new Error("Category with this slug already exists.");
    }

    // Calculate level based on parent
    if (data.parentCategory) {
      const parent = await Category.findById(data.parentCategory);
      if (parent) {
        data.level = parent.level + 1;
      } else {
        data.parentCategory = null;
        data.level = 0;
      }
    } else {
      data.level = 0;
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
    
    if (data.slug) {
      const existing = await Category.findOne({ slug: data.slug, _id: { $ne: id } });
      if (existing) throw new Error("Category with this slug already exists.");
    }

    if (data.parentCategory) {
      const parent = await Category.findById(data.parentCategory);
      if (parent) {
        data.level = parent.level + 1;
      } else {
        data.parentCategory = null;
        data.level = 0;
      }
    } else if (data.parentCategory === null || data.parentCategory === "") {
       data.parentCategory = null;
       data.level = 0;
    }
    
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

// Soft Delete
export async function deleteCategory(id: string) {
  try {
    const session = await requireAdmin();
    await connectDB();
    
    const category = await Category.findByIdAndUpdate(id, { 
      isDeleted: true, 
      deletedAt: new Date(),
      isActive: false 
    }, { new: true });
    
    if (!category) throw new Error("Category not found");
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await activityLogService.logAction(
      "Category Soft Deleted",
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

export async function restoreCategory(id: string) {
  try {
    const session = await requireAdmin();
    await connectDB();
    
    const category = await Category.findByIdAndUpdate(id, { 
      isDeleted: false, 
      $unset: { deletedAt: 1 } 
    }, { new: true });
    
    if (!category) throw new Error("Category not found");
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await activityLogService.logAction(
      "Category Restored",
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

export async function bulkDeleteCategories(ids: string[]) {
  try {
    const session = await requireAdmin();
    await connectDB();
    
    await Category.updateMany({ _id: { $in: ids } }, { 
      isDeleted: true, 
      deletedAt: new Date(),
      isActive: false 
    });
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await activityLogService.logAction(
      "Bulk Delete Categories",
      "Category",
      undefined,
      session.user.id,
      { count: ids.length, ids }
    );
    
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateCategoryStatus(ids: string[], isActive: boolean) {
  try {
    const session = await requireAdmin();
    await connectDB();
    
    await Category.updateMany({ _id: { $in: ids } }, { isActive });
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await activityLogService.logAction(
      `Bulk ${isActive ? 'Publish' : 'Disable'} Categories`,
      "Category",
      undefined,
      session.user.id,
      { count: ids.length, ids }
    );
    
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
