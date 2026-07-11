import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  subcategory?: string;
  brand?: string;
  price: number;
  discount?: number;
  finalPrice: number;
  stock: number;
  sku?: string;
  material?: string;
  weight?: string;
  color?: string;
  occasion?: string;
  images: string[];
  image360?: string;
  videoUrl?: string;
  isActive: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  attributes?: Record<string, string>; // Extra dynamic attributes
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: String, trim: true },
    brand: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, max: 100 },
    finalPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, trim: true },
    material: { type: String, trim: true },
    weight: { type: String, trim: true },
    color: { type: String, trim: true },
    occasion: { type: String, trim: true },
    images: [{ type: String }],
    image360: { type: String },
    videoUrl: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    metaKeywords: [{ type: String, trim: true }],
    attributes: { type: Map, of: String },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimization
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isBestSeller: 1 });
ProductSchema.index({ isTrending: 1 });

// Text search index
ProductSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text', metaKeywords: 'text' });

// Pre-save hook to calculate finalPrice if discount exists
// @ts-ignore
ProductSchema.pre('validate', function(next: any) {
  if (this.price != null) {
    if (this.discount && this.discount > 0) {
      this.finalPrice = this.price - (this.price * (this.discount / 100));
    } else {
      this.finalPrice = this.price;
    }
  }
  next();
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
