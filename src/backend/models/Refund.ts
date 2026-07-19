import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRefund extends Document {
  return: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  upiId: string;
  transactionReference?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema: Schema<IRefund> = new Schema(
  {
    return: { type: Schema.Types.ObjectId, ref: 'Return', required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    upiId: { type: String, required: true },
    transactionReference: { type: String },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending'
    }
  },
  {
    timestamps: true,
  }
);

// RefundSchema.index({ return: 1 }); // Removed due to duplicate index warning (already unique: true)
RefundSchema.index({ order: 1 });
RefundSchema.index({ user: 1 });
RefundSchema.index({ status: 1 });

const Refund: Model<IRefund> = mongoose.models.Refund || mongoose.model<IRefund>('Refund', RefundSchema);

export default Refund;
