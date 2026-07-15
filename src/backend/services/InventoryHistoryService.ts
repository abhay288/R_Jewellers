import { InventoryRepository } from '../repositories/InventoryRepository';
import InventoryHistory, { IInventoryHistory } from '../models/InventoryHistory';
import mongoose from 'mongoose';

export class InventoryHistoryService {
  async logChange(data: {
    product: string;
    previousStock: number;
    newStock: number;
    changeQuantity: number;
    reason: IInventoryHistory['reason'];
    referenceId?: string;
    userId?: string;
    notes?: string;
  }) {
    const history = new InventoryHistory({
      product: new mongoose.Types.ObjectId(data.product),
      previousStock: data.previousStock,
      newStock: data.newStock,
      changeQuantity: data.changeQuantity,
      reason: data.reason,
      referenceId: data.referenceId ? new mongoose.Types.ObjectId(data.referenceId) : undefined,
      user: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
      notes: data.notes
    });

    return history.save();
  }

  async getHistory(filter: Record<string, any> = {}, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      InventoryHistory.find(filter)
        .populate('product', 'name sku')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      InventoryHistory.countDocuments(filter).exec()
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
