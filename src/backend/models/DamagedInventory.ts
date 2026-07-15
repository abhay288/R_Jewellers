import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDamagedInventory extends Document {
  product: mongoose.Types.ObjectId;
  quantity: number;
  return?: mongoose.Types.ObjectId;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const DamagedInventorySchema: Schema<IDamagedInventory> = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    return: { type: Schema.Types.ObjectId, ref: 'Return' },
    reason: { type: String, required: true }
  },
  {
    timestamps: true,
  }
);

DamagedInventorySchema.index({ product: 1 });

const DamagedInventory: Model<IDamagedInventory> = mongoose.models.DamagedInventory || mongoose.model<IDamagedInventory>('DamagedInventory', DamagedInventorySchema);

export default DamagedInventory;
