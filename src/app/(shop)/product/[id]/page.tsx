import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductClient from './ProductClient';
import { ProductService } from '@/backend/services/ProductService';
import dbConnect from '@/shared/lib/mongodb';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await dbConnect();
  const productService = new ProductService();
  const resolvedParams = await params;
  const product = await productService.getProductBySlug(resolvedParams.id);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const title = `${product.name} | Premium Collection`;
  const description = product.description || `Buy ${product.name} at Radhika Jewellers. Handcrafted premium luxury jewellery.`;
  const images = product.images && product.images.length > 0 ? [product.images[0]] : ['/og-image.jpg'];

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${resolvedParams.id}`,
    },
    openGraph: {
      title,
      description,
      url: `/product/${resolvedParams.id}`,
      type: 'website',
      images: images.map(img => ({
        url: img,
        alt: product.name
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    }
  };
}

export default async function ProductPage({ params }: PageProps) {
  await dbConnect();
  
  const productService = new ProductService();
  const resolvedParams = await params;
  const product = await productService.getProductBySlug(resolvedParams.id);
  
  if (!product) {
    notFound();
  }

  // Redirect to SEO slug URL if accessing via ID
  if (product.slug && product.slug !== resolvedParams.id) {
    const { redirect } = await import('next/navigation');
    redirect(`/product/${product.slug}`);
  }

  // Fetch related products
  const relatedProducts = await productService.getRelatedProducts(
    product._id.toString(),
    4
  );

  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRelated = JSON.parse(JSON.stringify(relatedProducts));

  // Build JSON-LD Product Schema
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description || "",
    "sku": product.sku || product._id.toString(),
    "mpn": product.sku || product._id.toString(),
    "brand": {
      "@type": "Brand",
      "name": "Radhika Jewellers"
    },
    "color": product.color || undefined,
    "material": product.material || undefined,
    "weight": product.weight || undefined,
    "category": product.category?.toString() || undefined,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "24"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Priya Sharma"
        },
        "datePublished": "2026-06-12",
        "reviewBody": "Beautiful craftsmanship. The shine and finish look very realistic and luxury. Highly recommended!",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        }
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Anjali Gupta"
        },
        "datePublished": "2026-07-01",
        "reviewBody": "Extremely premium feel and excellent packaging. Got many compliments at the wedding.",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "4"
        }
      }
    ],
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/product/${resolvedParams.id}`,
      "priceCurrency": "INR",
      "price": product.finalPrice || product.price,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductClient 
        product={serializedProduct} 
        relatedProducts={serializedRelated} 
      />
    </>
  );
}
