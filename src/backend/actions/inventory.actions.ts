"use server";

import connectDB from "@/shared/lib/mongodb";
import Product from "@/backend/models/Product";
import InventoryHistory from "@/backend/models/InventoryHistory";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getInventoryDashboardStats() {
  try {
    await requireAdmin();
    await connectDB();

    const products = await Product.find({ isDeleted: { $ne: true } });
    
    const totalProducts = products.length;
    let lowStock = 0;
    let outOfStock = 0;
    let availableStock = 0;
    let inventoryValue = 0;

    products.forEach((product) => {
      availableStock += product.stock;
      const unitValue = product.purchaseCost || product.finalPrice || product.price || 0;
      inventoryValue += product.stock * unitValue;
      
      if (product.stock === 0) {
        outOfStock++;
      } else if (product.stock <= (product.minimumStock || 10)) {
        lowStock++;
      }
    });

    return {
      success: true,
      data: {
        totalProducts,
        lowStock,
        outOfStock,
        availableStock,
        inventoryValue,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getInventoryHistory(page = 1, limit = 50) {
  try {
    await requireAdmin();
    await connectDB();

    const skip = (page - 1) * limit;

    const history = await InventoryHistory.find()
      .populate('product', 'name sku')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InventoryHistory.countDocuments();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(history)),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
