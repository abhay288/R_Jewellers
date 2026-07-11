import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  user?: mongoose.Types.ObjectId; // null for system actions
  action: string;
  entityType: string; // e.g., 'Order', 'Product', 'User'
  entityId?: mongoose.Types.ObjectId;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema: Schema<IActivityLog> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  {
    timestamps: true,
  }
);

ActivityLogSchema.index({ user: 1 });
ActivityLogSchema.index({ entityType: 1, entityId: 1 });
ActivityLogSchema.index({ createdAt: -1 });

const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
