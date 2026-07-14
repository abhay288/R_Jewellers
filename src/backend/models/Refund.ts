import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRefund extends Document {
  returnRequest: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema: Schema<IRefund> = new Schema(
  {
    returnRequest: { type: Schema.Types.ObjectId, ref: 'Return', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
    },
    transactionId: { type: String },
  },
  {
    timestamps: true,
  }
);

RefundSchema.index({ user: 1 });
RefundSchema.index({ order: 1 });
RefundSchema.index({ status: 1 });

const Refund: Model<IRefund> = mongoose.models.Refund || mongoose.model<IRefund>('Refund', RefundSchema);

export default Refund;
