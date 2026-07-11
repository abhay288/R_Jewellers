import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  shippingAddress: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
      default: 'pending' 
    },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed'], 
      default: 'pending' 
    },
    paymentMethod: { type: String },
    shippingAddress: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
