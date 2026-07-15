import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';
import { ProductService } from '@/backend/services/ProductService';
import dbConnect from '@/shared/lib/mongodb';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const productService = new ProductService();
  
  const resolvedParams = await params;
  const product = await productService.getProductBySlug(resolvedParams.id);
  
  if (!product) {
    notFound();
  }

  // Fetch related products (same category)
  const relatedProducts = await productService.getRelatedProducts(
    product._id.toString(),
    product.category?.toString()
  );

  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRelated = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <ProductClient 
      product={serializedProduct} 
      relatedProducts={serializedRelated} 
    />
  );
}
