import ShopClient from './ShopClient';
import { ProductService } from '@/backend/services/ProductService';
import { CategoryService } from '@/backend/services/CategoryService';
import dbConnect from '@/shared/lib/mongodb';

// Allow this page to be dynamically rendered to handle search parameters
export const dynamic = 'force-dynamic';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await dbConnect();
  
  const productService = new ProductService();
  const categoryService = new CategoryService();

  const resolvedSearchParams = await searchParams;

  // Extract params
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : 'All';
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';
  const minPrice = typeof resolvedSearchParams.minPrice === 'string' ? resolvedSearchParams.minPrice : undefined;
  const maxPrice = typeof resolvedSearchParams.maxPrice === 'string' ? resolvedSearchParams.maxPrice : undefined;
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page, 10) : 1;

  // Fetch initial data
  const [productsData, categoriesData] = await Promise.all([
    productService.getStorefrontProducts({ category, minPrice, maxPrice, search }, sort, page, 12),
    categoryService.getCategories()
  ]);

  const serializedProducts = JSON.parse(JSON.stringify(productsData));
  const serializedCategories = JSON.parse(JSON.stringify(categoriesData));

  return (
    <ShopClient 
      initialProducts={serializedProducts}
      categories={serializedCategories}
      initialCategory={category}
      initialSort={sort}
    />
  );
}
