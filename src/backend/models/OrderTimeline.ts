import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderTimeline extends Document {
  order: mongoose.Types.ObjectId;
  status: 'Order Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out For Delivery' | 'Delivered' | 'Cancelled' | 'Returned';
  updatedBy: string; // 'System', 'Admin ID', or 'Customer ID'
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderTimelineSchema: Schema<IOrderTimeline> = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    status: { 
      type: String, 
      enum: ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Returned'], 
      required: true 
    },
    updatedBy: { type: String, required: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

OrderTimelineSchema.index({ order: 1 });
OrderTimelineSchema.index({ createdAt: -1 });

const OrderTimeline: Model<IOrderTimeline> = mongoose.models.OrderTimeline || mongoose.model<IOrderTimeline>('OrderTimeline', OrderTimelineSchema);

export default OrderTimeline;
