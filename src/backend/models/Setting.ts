import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: any;
  group: 'general' | 'payment' | 'shipping' | 'seo' | 'ai';
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema: Schema<ISetting> = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    group: {
      type: String,
      enum: ['general', 'payment', 'shipping', 'seo', 'ai'],
      default: 'general',
    },
  },
  {
    timestamps: true,
  }
);

SettingSchema.index({ key: 1 });
SettingSchema.index({ group: 1 });

const Setting: Model<ISetting> = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);

export default Setting;
