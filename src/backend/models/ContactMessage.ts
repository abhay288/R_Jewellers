import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactMessage extends Document {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema: Schema<IContactMessage> = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ isRead: 1 });

const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

export default ContactMessage;
