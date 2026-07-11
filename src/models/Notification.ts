import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  isRead: boolean;
  type: 'order' | 'promo' | 'system' | 'account';
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['order', 'promo', 'system', 'account'],
      default: 'system',
    },
    link: { type: String },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
