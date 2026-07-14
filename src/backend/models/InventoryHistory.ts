import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryHistory extends Document {
  product: mongoose.Types.ObjectId;
  previousStock: number;
  newStock: number;
  changeQuantity: number;
  reason: 'Added' | 'Reduced' | 'Sold' | 'Returned' | 'Adjusted' | 'Damaged';
  referenceId?: mongoose.Types.ObjectId | string; // Order ID or Return ID
  user?: mongoose.Types.ObjectId; // Admin who made the change
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryHistorySchema: Schema<IInventoryHistory> = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    changeQuantity: { type: Number, required: true },
    reason: { 
      type: String, 
      enum: ['Added', 'Reduced', 'Sold', 'Returned', 'Adjusted', 'Damaged'],
      required: true 
    },
    referenceId: { type: Schema.Types.Mixed },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

InventoryHistorySchema.index({ product: 1, createdAt: -1 });
InventoryHistorySchema.index({ reason: 1 });

const InventoryHistory: Model<IInventoryHistory> = mongoose.models.InventoryHistory || mongoose.model<IInventoryHistory>('InventoryHistory', InventoryHistorySchema);

export default InventoryHistory;
