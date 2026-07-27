import { MetadataRoute } from 'next';
import connectDB from '@/shared/lib/mongodb';
import Product from '@/backend/models/Product';
import Category from '@/backend/models/Category';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.radhikajewellers.store';
  const now = new Date();

  // ── Static high-priority pages ─────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/cancellation`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  try {
    await connectDB();

    // ── Product pages (high value) ───────────────────────────────────────────
    const products = await Product.find({ status: 'Published', isActive: true })
      .select('slug updatedAt')
      .lean();

    const productRoutes: MetadataRoute.Sitemap = products.map((prod: any) => ({
      url: `${baseUrl}/product/${prod.slug || prod._id.toString()}`,
      lastModified: prod.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // ── Category shop-filter pages ───────────────────────────────────────────
    const categories = await Category.find({ isActive: true, isDeleted: false })
      .select('slug name updatedAt')
      .lean();

    const categoryRoutes: MetadataRoute.Sitemap = categories
      .filter((cat: any) => cat.slug)
      .map((cat: any) => ({
        url: `${baseUrl}/shop?category=${cat.slug}`,
        lastModified: cat.updatedAt || now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
