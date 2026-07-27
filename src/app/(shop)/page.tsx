import HomeClient from './HomeClient';
import { ProductService } from '@/backend/services/ProductService';
import { CategoryService } from '@/backend/services/CategoryService';
import dbConnect from '@/shared/lib/mongodb';

// Enable 300-second ISR cache for 0ms instant home page rendering
export const revalidate = 300;

export default async function HomePage() {
  await dbConnect();
  
  const productService = new ProductService();
  const categoryService = new CategoryService();
  
  // Fetch data in parallel
  const [featuredProducts, trendingProducts, bestSellers, categories] = await Promise.all([
    productService.getFeaturedProducts(4),
    productService.getTrendingProducts(8),
    productService.getBestSellers(4),
    categoryService.getCategories({ level: 0 }) // Top level categories for featured collections
  ]);

  // We need to convert Mongoose documents to plain objects to pass them to Client Components
  const serializedFeatured = JSON.parse(JSON.stringify(featuredProducts));
  const serializedTrending = JSON.parse(JSON.stringify(trendingProducts));
  const serializedBestSellers = JSON.parse(JSON.stringify(bestSellers));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <HomeClient 
      featuredProducts={serializedFeatured} 
      trendingProducts={serializedTrending} 
      bestSellers={serializedBestSellers} 
      categories={serializedCategories}
    />
  );
}
