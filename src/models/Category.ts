import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  isActive: boolean;
  parentCategory?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
    bannerImage: { type: String },
    isActive: { type: Boolean, default: true },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
