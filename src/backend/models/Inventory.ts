import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventory extends Document {
  product: mongoose.Types.ObjectId;
  sku: string;
  quantity: number;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema: Schema<IInventory> = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    sku: { type: String, required: true, unique: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    location: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

InventorySchema.index({ sku: 1 });
InventorySchema.index({ product: 1 });

const Inventory: Model<IInventory> = mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);

export default Inventory;
