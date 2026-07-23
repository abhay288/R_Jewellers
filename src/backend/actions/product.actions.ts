"use server";

import connectDB from "@/shared/lib/mongodb";
import Product from "@/backend/models/Product";
import InventoryHistory from "@/backend/models/InventoryHistory";
import Notification from "@/backend/models/Notification";
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

export async function createProduct(data: any) {
  try {
    const session = await requireAdmin();
    await connectDB();
    const Category = (await import("@/backend/models/Category")).default;

    // Resolve or Auto-Create Category if passed as custom name or non-ObjectId
    if (data.category && typeof data.category === 'string') {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(data.category);
      if (!isValidObjectId) {
        const catName = data.category.trim();
        const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        let existingCat = await Category.findOne({
          $or: [
            { name: { $regex: new RegExp(`^${catName}$`, 'i') } },
            { slug: catSlug }
          ]
        });
        if (!existingCat) {
          existingCat = await Category.create({
            name: catName,
            slug: catSlug,
            description: `${catName} collection at Radhika Jewellers`,
            isActive: true,
          });
        }
        data.category = existingCat._id.toString();
      }
    }
    
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    try {
      const { AIService } = require("@/backend/services/AIService");
      const aiService = new AIService();
      const textToEmbed = `${data.name}. ${data.description || ""}. Category: ${data.material || ""}`;
      const embedding = await aiService.generateEmbedding(textToEmbed);
      if (embedding) {
        data.embedding = embedding;
      }
    } catch (err) {
      console.error("Failed to generate embedding during product creation:", err);
    }

    if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
      data.images = ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800"];
    }

    if (data.sku) {
      const existingSku = await Product.findOne({ sku: data.sku });
      if (existingSku) throw new Error("Product with this SKU already exists.");
    }
    
    const product = await Product.create(data);
    const userId = (session?.user as any)?.id || (session?.user as any)?._id || session?.user?.email || 'admin';
    
    try {
      if (product.stock > 0 && userId) {
        await InventoryHistory.create({
          product: product._id,
          previousStock: 0,
          newStock: product.stock,
          changeQuantity: product.stock,
          reason: 'Added',
          user: userId,
          notes: 'Initial stock on creation',
        });
      }
      
      await activityLogService.logAction(
        "Product Created",
        "Product",
        product._id,
        userId,
        { productName: product.name }
      );
    } catch (logErr) {
      console.warn("Secondary logging warning:", logErr);
    }
    
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    console.error("createProduct error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const session = await requireAdmin();
    await connectDB();
    const Category = (await import("@/backend/models/Category")).default;

    // Resolve or Auto-Create Category if passed as custom name or non-ObjectId
    if (data.category && typeof data.category === 'string') {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(data.category);
      if (!isValidObjectId) {
        const catName = data.category.trim();
        const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        let existingCat = await Category.findOne({
          $or: [
            { name: { $regex: new RegExp(`^${catName}$`, 'i') } },
            { slug: catSlug }
          ]
        });
        if (!existingCat) {
          existingCat = await Category.create({
            name: catName,
            slug: catSlug,
            description: `${catName} collection at Radhika Jewellers`,
            isActive: true,
          });
        }
        data.category = existingCat._id.toString();
      }
    }
    
    if (data.sku) {
      const existingSku = await Product.findOne({ sku: data.sku, _id: { $ne: id } });
      if (existingSku) throw new Error("Product with this SKU already exists.");
    }

    const currentProduct = await Product.findById(id);
    if (!currentProduct) throw new Error("Product not found");

    try {
      const { AIService } = require("@/backend/services/AIService");
      const aiService = new AIService();
      const textToEmbed = `${data.name || currentProduct.name}. ${data.description || currentProduct.description || ""}. Category: ${data.material || currentProduct.material || ""}`;
      const embedding = await aiService.generateEmbedding(textToEmbed);
      if (embedding) {
        data.embedding = embedding;
      }
    } catch (err) {
      console.error("Failed to generate embedding during product update:", err);
    }

    const previousStock = currentProduct.stock;
    
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!product) throw new Error("Product not found");

    if (data.stock !== undefined && data.stock !== previousStock && session?.user?.id) {
      const diff = data.stock - previousStock;
      const reason = diff > 0 ? 'Added' : 'Adjusted';
      await InventoryHistory.create({
        product: product._id,
        previousStock,
        newStock: product.stock,
        changeQuantity: diff,
        reason: reason,
        user: session.user.id,
        notes: 'Stock updated via product edit',
      });

      // Check low stock alert
      if (product.stock < product.minimumStock) {
        await Notification.create({
          user: session.user.id, // Assuming the admin who caused it or system admin gets it
          title: 'Low Stock Alert',
          message: `${product.name} (SKU: ${product.sku || 'N/A'}) has fallen below minimum stock level (${product.stock}/${product.minimumStock}).`,
          type: 'system',
          link: `/admin/inventory`
        });
      }
    }
    
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

export async function updateProductStock(id: string, newStock: number, reason: 'Added' | 'Reduced' | 'Sold' | 'Returned' | 'Adjusted' | 'Damaged', notes?: string) {
  try {
    const session = await requireAdmin();
    await connectDB();
    
    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    const previousStock = product.stock;
    const diff = newStock - previousStock;
    
    product.stock = newStock;
    if (newStock === 0) product.status = 'Out Of Stock';
    else if (product.status === 'Out Of Stock' && newStock > 0) product.status = 'Published';
    
    await product.save();

    if (session?.user?.id) {
      await InventoryHistory.create({
        product: product._id,
        previousStock,
        newStock: product.stock,
        changeQuantity: diff,
        reason: reason,
        user: session.user.id,
        notes: notes,
      });

      // Low stock check
      if (product.stock < product.minimumStock) {
        await Notification.create({
          user: session.user.id,
          title: 'Low Stock Alert',
          message: `${product.name} (SKU: ${product.sku || 'N/A'}) has fallen below minimum stock level (${product.stock}/${product.minimumStock}).`,
          type: 'system',
          link: `/admin/inventory`
        });
      }

      await activityLogService.logAction(
        "Stock Adjusted",
        "Product",
        product._id,
        session.user.id,
        { productName: product.name, previousStock, newStock }
      );
    }
    
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
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
    
    const status = isActive ? 'Published' : 'Draft';
    const product = await Product.findByIdAndUpdate(id, { isActive, status }, { new: true });
    if (!product) throw new Error("Product not found");
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await activityLogService.logAction(
      "Product Status Toggled",
      "Product",
      product._id,
      session.user.id,
      { productName: product.name, isActive, status }
    );
    
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    if (product.slug) {
      revalidatePath(`/product/${product.slug}`);
    }
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
