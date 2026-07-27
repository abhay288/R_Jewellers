import { Metadata } from 'next';
import ShopClient from './ShopClient';
import { ProductService } from '@/backend/services/ProductService';
import { CategoryService } from '@/backend/services/CategoryService';
import dbConnect from '@/shared/lib/mongodb';

// Enable 30-second stale-while-revalidate ISR cache for instant shop page rendering
export const revalidate = 30;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const category = typeof resolved.category === 'string' ? resolved.category : 'All';
  const search = typeof resolved.search === 'string' ? resolved.search : undefined;

  let title = 'Buy Premium Artificial Jewellery Online | Radhika Jewellers';
  let description = 'Explore Radhika Jewellers collection of handcrafted artificial jewellery, Kundan sets, 22K gold plated necklaces, jhumka earrings, bangles & bridal sets. Free pan-India shipping.';

  if (search) {
    title = `Search results for "${search}" | Radhika Jewellers`;
    description = `Find the best artificial jewellery for "${search}" at Radhika Jewellers. Handcrafted Kundan & gold-plated designs.`;
  } else if (category && category !== 'All') {
    const formattedCat = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    title = `${formattedCat} — Luxury Artificial Jewellery | Radhika Jewellers`;
    description = `Shop handcrafted ${formattedCat} at Radhika Jewellers. Royal Indian designs, 22K gold micro-plated, hypoallergenic & 100% skin safe.`;
  }

  return {
    title,
    description,
    keywords: [
      'artificial jewellery',
      'imitation jewellery online',
      'Radhika Jewellers',
      'kundan necklace set',
      'gold plated jewellery',
      'bridal artificial jewellery',
      'jhumka earrings online',
      'wedding jewellery set',
      category !== 'All' ? category : 'jewellery india'
    ].join(', '),
    alternates: {
      canonical: `/shop${category && category !== 'All' ? `?category=${category}` : ''}`,
    },
    openGraph: {
      title,
      description,
      url: `/shop`,
      type: 'website',
      siteName: 'Radhika Jewellers',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

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
  const collection = typeof resolvedSearchParams.collection === 'string' ? resolvedSearchParams.collection : 'All';
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';
  const minPrice = typeof resolvedSearchParams.minPrice === 'string' ? resolvedSearchParams.minPrice : undefined;
  const maxPrice = typeof resolvedSearchParams.maxPrice === 'string' ? resolvedSearchParams.maxPrice : undefined;
  const inStock = typeof resolvedSearchParams.inStock === 'string' ? resolvedSearchParams.inStock : undefined;
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page, 10) : 1;

  // Fetch initial data
  const [productsData, categoriesData] = await Promise.all([
    productService.getStorefrontProducts({ category, collection, minPrice, maxPrice, inStock, search }, sort, page, 12),
    categoryService.getCategories()
  ]);

  const serializedProducts = JSON.parse(JSON.stringify(productsData));
  const serializedCategories = JSON.parse(JSON.stringify(categoriesData));

  return (
    <ShopClient 
      initialProducts={serializedProducts}
      categories={serializedCategories}
      initialCategory={category}
      initialCollection={collection}
      initialSort={sort}
      initialMinPrice={minPrice}
      initialMaxPrice={maxPrice}
      initialInStock={inStock}
      initialSearch={search}
      currentPage={page}
    />
  );
}
