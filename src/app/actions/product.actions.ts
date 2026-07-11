"use server";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
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

export async function createProduct(data: any) {
  try {
    const session = await requireAdmin();
    await connectDB();
    
    // Automatically generate slug if not provided or empty
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    const product = await Product.create(data);
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await activityLogService.logAction(
      "Product Created",
      "Product",
      product._id,
      session.user.id,
      { productName: product.name }
    );
    
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const session = await requireAdmin();
    await connectDB();
    
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!product) throw new Error("Product not found");
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await activityLogService.logAction(
      "Product Updated",
      "Product",
      product._id,
      session.user.id,
      { productName: product.name }
    );
    
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await requireAdmin();
    await connectDB();
    
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new Error("Product not found");
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await activityLogService.logAction(
      "Product Deleted",
      "Product",
      product._id,
      session.user.id,
      { productName: product.name }
    );
    
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  try {
    const session = await requireAdmin();
    await connectDB();
    
    const product = await Product.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!product) throw new Error("Product not found");
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await activityLogService.logAction(
      "Product Status Toggled",
      "Product",
      product._id,
      session.user.id,
      { productName: product.name, isActive }
    );
    
    revalidatePath("/admin/products");
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
