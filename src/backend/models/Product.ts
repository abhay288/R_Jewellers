import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: mongoose.Types.ObjectId;
  subcategory?: string;
  collectionName?: string;
  brand?: string;
  price: number;
  mrp?: number;
  discount?: number;
  finalPrice: number;
  stock: number;
  minimumStock: number;
  maximumStock?: number;
  sku?: string;
  barcode?: string;
  supplier?: string;
  warehouse?: string;
  purchaseCost?: number;
  status: 'Draft' | 'Published' | 'Archived' | 'Out Of Stock' | 'Coming Soon' | 'Discontinued';
  material?: string;
  stone?: string;
  weight?: string;
  dimensions?: string;
  color?: string;
  size?: string;
  gender?: 'Women' | 'Men' | 'Unisex';
  occasion?: string;
  style?: string;
  images: string[];
  image360?: string;
  videoUrl?: string;
  isActive: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  tags?: string[];
  careInstructions?: string;
  shippingInfo?: string;
  returnPolicy?: string;
  warranty?: string;
  averageRating?: number;
  reviewCount?: number;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  attributes?: Record<string, string>;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: String, trim: true },
    collectionName: { type: String, trim: true },
    brand: { type: String, trim: true, default: 'Radhika Jewellers' },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    finalPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 10, min: 0 },
    minimumStock: { type: Number, default: 2, min: 0 },
    maximumStock: { type: Number, min: 0 },
    sku: { type: String, trim: true },
    barcode: { type: String, trim: true },
    supplier: { type: String, trim: true },
    warehouse: { type: String, trim: true },
    purchaseCost: { type: Number, min: 0 },
    status: { 
      type: String, 
      enum: ['Draft', 'Published', 'Archived', 'Out Of Stock', 'Coming Soon', 'Discontinued'],
      default: 'Published'
    },
    material: { type: String, trim: true, default: 'Brass Alloy with Gold Plating' },
    stone: { type: String, trim: true, default: 'Kundan & CZ Gemstones' },
    weight: { type: String, trim: true },
    dimensions: { type: String, trim: true },
    color: { type: String, trim: true, default: 'Gold' },
    size: { type: String, trim: true },
    gender: { type: String, enum: ['Women', 'Men', 'Unisex'], default: 'Women' },
    occasion: { type: String, trim: true, default: 'Bridal & Festive' },
    style: { type: String, trim: true, default: 'Traditional Royal' },
    images: [{ type: String }],
    image360: { type: String },
    videoUrl: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
    careInstructions: { 
      type: String, 
      default: 'Keep away from moisture, perfumes, and harsh chemicals. Store in a soft velvet container after use.' 
    },
    shippingInfo: { 
      type: String, 
      default: 'Dispatched within 24-48 hours. Free insured pan-India delivery.' 
    },
    returnPolicy: { 
      type: String, 
      default: 'Easy 48-hour return and replacement policy for damaged or defective items.' 
    },
    warranty: { 
      type: String, 
      default: '6-Month Warranty on Gold Plating & Kundan Settings.' 
    },
    averageRating: { type: Number, default: 4.8, min: 0, max: 5 },
    reviewCount: { type: Number, default: 18, min: 0 },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    metaKeywords: [{ type: String, trim: true }],
    attributes: { type: Map, of: String },
    embedding: [{ type: Number }],
  },
  {
    timestamps: true,
  }
);

// Indexes
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isBestSeller: 1 });
ProductSchema.index({ isTrending: 1 });

// Text search index
ProductSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text', metaKeywords: 'text' });

// Pre-validate hook to calculate finalPrice, generate auto-slug, and SKU
// @ts-ignore
ProductSchema.pre('validate', function(next: any) {
  // 1. Auto-generate slug if missing
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // 2. Auto-generate SKU if missing
  if (this.name && !this.sku) {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const prefix = this.name.substring(0, 3).toUpperCase();
    this.sku = `RJ-${prefix}-${randomCode}`;
  }

  // 3. Price & MRP & FinalPrice Calculation
  if (this.price != null) {
    if (!this.mrp || this.mrp < this.price) {
      this.mrp = Math.round(this.price * 1.3); // Default MRP 30% higher than base price
    }
    if (this.discount && this.discount > 0) {
      this.finalPrice = Math.round(this.price - (this.price * (this.discount / 100)));
    } else {
      this.finalPrice = this.price;
    }
  }

  next();
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
