import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import Product from '@/backend/models/Product';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, productIds, payload } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'No product IDs provided for bulk action.' }, { status: 400 });
    }

    await connectDB();
    const objectIds = productIds.map(id => new mongoose.Types.ObjectId(id));

    let updateResult: any;

    switch (action) {
      case 'bulk_delete':
        // Soft delete or hard delete
        updateResult = await Product.updateMany(
          { _id: { $in: objectIds } },
          { $set: { isDeleted: true, isActive: false, deletedAt: new Date() } }
        );
        break;

      case 'bulk_restore':
        updateResult = await Product.updateMany(
          { _id: { $in: objectIds } },
          { $set: { isDeleted: false, isActive: true, deletedAt: null } }
        );
        break;

      case 'bulk_price_update':
        const { mode, value } = payload || {}; // mode: 'fixed' | 'percentage', value: number
        const numVal = parseFloat(value);
        if (isNaN(numVal)) {
          return NextResponse.json({ error: 'Invalid numeric value for price update.' }, { status: 400 });
        }

        const productsToUpdate = await Product.find({ _id: { $in: objectIds } });
        for (const p of productsToUpdate) {
          let newPrice = p.price;
          if (mode === 'percentage') {
            newPrice = Math.max(0, Math.round(p.price * (1 + numVal / 100)));
          } else {
            newPrice = Math.max(0, p.price + numVal);
          }
          const mrp = p.mrp && p.mrp > newPrice ? p.mrp : Math.round(newPrice * 1.3);
          const discount = p.discount || 0;
          const finalPrice = discount > 0 ? Math.round(newPrice - (newPrice * (discount / 100))) : newPrice;

          p.price = newPrice;
          p.mrp = mrp;
          p.finalPrice = finalPrice;
          await p.save();
        }
        updateResult = { modifiedCount: productsToUpdate.length };
        break;

      case 'bulk_stock_update':
        const { stockMode, stockValue } = payload || {}; // stockMode: 'set' | 'add', stockValue: number
        const valStock = parseInt(stockValue, 10);
        if (isNaN(valStock)) {
          return NextResponse.json({ error: 'Invalid numeric value for stock update.' }, { status: 400 });
        }

        if (stockMode === 'set') {
          updateResult = await Product.updateMany(
            { _id: { $in: objectIds } },
            { $set: { stock: Math.max(0, valStock), status: valStock > 0 ? 'Published' : 'Out Of Stock' } }
          );
        } else {
          // Increment / Decrement stock
          const prods = await Product.find({ _id: { $in: objectIds } });
          for (const p of prods) {
            const nextStock = Math.max(0, p.stock + valStock);
            p.stock = nextStock;
            p.status = nextStock > 0 ? 'Published' : 'Out Of Stock';
            await p.save();
          }
          updateResult = { modifiedCount: prods.length };
        }
        break;

      case 'bulk_toggle_active':
        updateResult = await Product.updateMany(
          { _id: { $in: objectIds } },
          { $set: { isActive: Boolean(payload?.value) } }
        );
        break;

      case 'bulk_toggle_featured':
        updateResult = await Product.updateMany(
          { _id: { $in: objectIds } },
          { $set: { isFeatured: Boolean(payload?.value) } }
        );
        break;

      case 'bulk_toggle_trending':
        updateResult = await Product.updateMany(
          { _id: { $in: objectIds } },
          { $set: { isTrending: Boolean(payload?.value) } }
        );
        break;

      case 'bulk_toggle_new_arrival':
        updateResult = await Product.updateMany(
          { _id: { $in: objectIds } },
          { $set: { isNewArrival: Boolean(payload?.value) } }
        );
        break;

      case 'bulk_change_category':
        if (!payload?.categoryId) {
          return NextResponse.json({ error: 'Target Category ID is required.' }, { status: 400 });
        }
        updateResult = await Product.updateMany(
          { _id: { $in: objectIds } },
          { $set: { category: new mongoose.Types.ObjectId(payload.categoryId) } }
        );
        break;

      case 'bulk_change_brand':
        if (!payload?.brand) {
          return NextResponse.json({ error: 'Target Brand is required.' }, { status: 400 });
        }
        updateResult = await Product.updateMany(
          { _id: { $in: objectIds } },
          { $set: { brand: payload.brand.trim() } }
        );
        break;

      case 'bulk_change_collection':
        updateResult = await Product.updateMany(
          { _id: { $in: objectIds } },
          { $set: { collectionName: (payload?.collectionName || '').trim() } }
        );
        break;

      default:
        return NextResponse.json({ error: `Unsupported bulk operation "${action}"` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      updatedCount: updateResult?.modifiedCount ?? updateResult?.nModified ?? productIds.length,
    });
  } catch (error: any) {
    console.error("Bulk Actions API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error during bulk action' }, { status: 500 });
  }
}
