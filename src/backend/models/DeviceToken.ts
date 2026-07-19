import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDeviceToken extends Document {
  user?: mongoose.Types.ObjectId; // Optional for guest/anonymous push tokens
  token: string;
  deviceType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceTokenSchema: Schema<IDeviceToken> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    token: { type: String, required: true, unique: true, trim: true },
    deviceType: { type: String, default: 'unknown' },
  },
  {
    timestamps: true,
  }
);

// DeviceTokenSchema.index({ token: 1 }); // Removed due to duplicate index warning (already unique: true)
DeviceTokenSchema.index({ user: 1 });

const DeviceToken: Model<IDeviceToken> =
  mongoose.models.DeviceToken || mongoose.model<IDeviceToken>('DeviceToken', DeviceTokenSchema);

export default DeviceToken;
