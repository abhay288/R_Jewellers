import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReturnTimeline extends Document {
  return: mongoose.Types.ObjectId;
  status: string;
  updatedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnTimelineSchema: Schema<IReturnTimeline> = new Schema(
  {
    return: { type: Schema.Types.ObjectId, ref: 'Return', required: true },
    status: { type: String, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  },
  {
    timestamps: true,
  }
);

ReturnTimelineSchema.index({ return: 1 });
ReturnTimelineSchema.index({ createdAt: -1 });

const ReturnTimeline: Model<IReturnTimeline> = mongoose.models.ReturnTimeline || mongoose.model<IReturnTimeline>('ReturnTimeline', ReturnTimelineSchema);

export default ReturnTimeline;
