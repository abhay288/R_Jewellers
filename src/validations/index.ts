import { z } from 'zod';

// Authentication Validations
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(50, 'Name is too long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User Validations
export const userSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(50, 'Name is too long'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['user', 'admin']).optional(),
  image: z.string().url('Invalid image URL').optional(),
});

// Product Validations
export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional().or(z.literal('')),
  brand: z.string().optional().or(z.literal('')),
  price: z.number().min(0, 'Price must be a positive number'),
  discount: z.number().min(0).max(100).optional(),
  stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
  sku: z.string().optional().or(z.literal('')),
  material: z.string().optional().or(z.literal('')),
  weight: z.string().optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
  occasion: z.string().optional().or(z.literal('')),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  image360: z.string().url('Invalid URL').optional().or(z.literal('')),
  videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional().or(z.literal('')),
  seoDescription: z.string().optional().or(z.literal('')),
  metaKeywords: z.array(z.string()).optional(),
});

// Category Validations
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  bannerImage: z.string().url('Invalid image URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

// Address Validations
export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(4, 'Valid zip code is required'),
  country: z.string().min(2, 'Country is required'),
  isDefault: z.boolean().optional(),
});

// Order Validations
export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0, 'Price must be valid'),
  })).min(1, 'Order must contain at least one item'),
  shippingAddress: addressSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

// Cart Validations
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  attributes: z.record(z.string(), z.string()).optional(),
});

// Review Validations
export const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(5, 'Comment must be at least 5 characters').max(500, 'Comment is too long'),
});

// Coupon Validations
export const couponSchema = z.object({
  code: z.string().min(3, 'Coupon code is too short').max(20, 'Coupon code is too long'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0, 'Discount value must be a positive number'),
  minPurchaseAmount: z.number().min(0).optional(),
  startDate: z.date().or(z.string()),
  endDate: z.date().or(z.string()),
  usageLimit: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});
