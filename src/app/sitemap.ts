import { MetadataRoute } from 'next';
import connectDB from '@/shared/lib/mongodb';
import Product from '@/backend/models/Product';
import Category from '@/backend/models/Category';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  // Static routes
  const staticRoutes = [
    '',
    '/shop',
    '/collections',
    '/login',
    '/signup',
    '/about',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    await connectDB();

    // Fetch products
    const products = await Product.find({ status: 'Published', isActive: true }).select('slug updatedAt');
    const productRoutes = products.map((prod) => ({
      url: `${baseUrl}/product/${prod.slug || prod._id.toString()}`,
      lastModified: prod.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Fetch categories
    const categories = await Category.find({ isActive: true, isDeleted: false }).select('slug updatedAt');
    const categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/collections/${cat.slug || cat._id.toString()}`,
      lastModified: cat.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
