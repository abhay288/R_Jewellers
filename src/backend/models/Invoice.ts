import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  order: mongoose.Types.ObjectId;
  orderId: string;
  user: mongoose.Types.ObjectId;
  totalAmount: number;
  pdfUrl?: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema<IInvoice> = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    orderId: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalAmount: { type: Number, required: true },
    pdfUrl: { type: String },
    generatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ order: 1 });
InvoiceSchema.index({ user: 1 });

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
