import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReturn extends Document {
  order: mongoose.Types.ObjectId;
  orderItem: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnSchema: Schema<IReturn> = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    orderItem: { type: Schema.Types.ObjectId, ref: 'OrderItem', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    adminNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

ReturnSchema.index({ user: 1 });
ReturnSchema.index({ order: 1 });
ReturnSchema.index({ status: 1 });

const Return: Model<IReturn> = mongoose.models.Return || mongoose.model<IReturn>('Return', ReturnSchema);

export default Return;
