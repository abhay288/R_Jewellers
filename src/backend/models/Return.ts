import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReturnProduct {
  product: mongoose.Types.ObjectId;
  quantity: number;
  refundAmount: number;
}

export interface IReturn extends Document {
  returnId: string;
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  products: IReturnProduct[];
  reason: string;
  notes?: string;
  images: string[];
  upiDetails: string;
  status: 'Return Requested' | 'Under Review' | 'Approved' | 'Pickup Scheduled' | 'Picked Up' | 'Received' | 'Quality Check' | 'Refund Approved' | 'Refund Completed' | 'Rejected';
  totalRefundAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnProductSchema = new Schema<IReturnProduct>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  refundAmount: { type: Number, required: true, min: 0 },
}, { _id: false });

const ReturnSchema: Schema<IReturn> = new Schema(
  {
    returnId: { type: String, required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [ReturnProductSchema],
    reason: { type: String, required: true },
    notes: { type: String, maxlength: 500 },
    images: [{ type: String }],
    upiDetails: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'Return Requested', 'Under Review', 'Approved', 'Pickup Scheduled', 
        'Picked Up', 'Received', 'Quality Check', 'Refund Approved', 
        'Refund Completed', 'Rejected'
      ],
      default: 'Return Requested'
    },
    totalRefundAmount: { type: Number, required: true, min: 0 }
  },
  {
    timestamps: true,
  }
);

ReturnSchema.index({ returnId: 1 });
ReturnSchema.index({ order: 1 });
ReturnSchema.index({ user: 1 });
ReturnSchema.index({ status: 1 });
ReturnSchema.index({ createdAt: -1 });

const Return: Model<IReturn> = mongoose.models.Return || mongoose.model<IReturn>('Return', ReturnSchema);

export default Return;
