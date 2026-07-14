import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  imageUrl: string;
  link?: string;
  position: 'hero' | 'sidebar' | 'footer' | 'popup';
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema<IBanner> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    link: { type: String },
    position: {
      type: String,
      enum: ['hero', 'sidebar', 'footer', 'popup'],
      default: 'hero',
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

BannerSchema.index({ isActive: 1, position: 1, order: 1 });

const Banner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;
