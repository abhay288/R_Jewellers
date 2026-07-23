import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IImportRowError {
  rowNumber: number;
  sku?: string;
  name?: string;
  reason: string;
  field?: string;
}

export interface IImportLog extends Document {
  sessionId: string;
  filename: string;
  totalRows: number;
  successCount: number;
  failedCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  rowErrors: IImportRowError[];
  createdCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ImportLogRowErrorSchema = new Schema<IImportRowError>({
  rowNumber: { type: Number, required: true },
  sku: { type: String },
  name: { type: String },
  reason: { type: String, required: true },
  field: { type: String }
}, { _id: false });

const ImportLogSchema: Schema<IImportLog> = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    filename: { type: String, required: true },
    totalRows: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    rowErrors: [ImportLogRowErrorSchema],
    createdCategories: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const ImportLog: Model<IImportLog> = mongoose.models.ImportLog || mongoose.model<IImportLog>('ImportLog', ImportLogSchema);

export default ImportLog;
