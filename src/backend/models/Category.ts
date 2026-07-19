import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  isFeatured: boolean;
  parentCategory?: mongoose.Types.ObjectId;
  level: number;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  isDeleted: boolean;
  deletedAt?: Date;
  viewCount: number;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
    bannerImage: { type: String },
    icon: { type: String },
    color: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    level: { type: Number, default: 0 },
    displayOrder: { type: Number, default: 0 },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: [{ type: String, trim: true }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    viewCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// CategorySchema.index({ slug: 1 }); // Removed due to duplicate index warning (already unique: true)
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ isDeleted: 1 });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ displayOrder: 1 });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
