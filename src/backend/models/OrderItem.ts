import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem extends Document {
  order: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema<IOrderItem> = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  }
);

OrderItemSchema.index({ order: 1 });
OrderItemSchema.index({ product: 1 });

const OrderItem: Model<IOrderItem> = mongoose.models.OrderItem || mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);

export default OrderItem;
