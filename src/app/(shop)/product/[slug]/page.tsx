import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductClient from '@/app/(shop)/product/[slug]/ProductClient';
import { ProductService } from '@/backend/services/ProductService';
import dbConnect from '@/shared/lib/mongodb';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await dbConnect();
  const productService = new ProductService();
  const resolvedParams = await params;
  const product = await productService.getProductBySlug(resolvedParams.slug);

  if (!product) {
    return {
      title: 'Product Not Found | Radhika Jewellers',
      description: 'The requested luxury jewellery item could not be found.',
    };
  }

  const title = product.seoTitle || `${product.name} | Radhika Jewellers`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    `Buy ${product.name} at Radhika Jewellers. Authentic designer luxury artificial jewellery with gold plating & Kundan settings.`;
  const images = product.images && product.images.length > 0 ? [product.images[0]] : ['/og-image.jpg'];

  return {
    title,
    description,
    keywords: product.metaKeywords?.length ? product.metaKeywords.join(', ') : `${product.name}, Radhika Jewellers, Kundan, Gold Jewellery, Artificial Jewellery`,
    alternates: {
      canonical: `/product/${product.slug || resolvedParams.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/product/${product.slug || resolvedParams.slug}`,
      type: 'website',
      siteName: 'Radhika Jewellers',
      images: images.map((img) => ({
        url: img,
        alt: product.name,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}

export default async function ProductSlugPage({ params }: PageProps) {
  await dbConnect();

  const productService = new ProductService();
  const resolvedParams = await params;
  const product = await productService.getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  // Fetch related products dynamically from MongoDB
  const relatedProducts = await productService.getRelatedProducts(product._id.toString(), 4);

  // Fetch authentic reviews from MongoDB
  const ReviewModel = (await import("@/backend/models/Review")).default;
  const dbReviews = await ReviewModel.find({ product: product._id, isApproved: true }).sort({ createdAt: -1 }).limit(5).lean();

  const realReviewCount = product.reviewCount || dbReviews.length || 0;
  const realAverageRating = product.averageRating || (dbReviews.length > 0 ? (dbReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / dbReviews.length) : 0);

  // Build Full Schema.org JSON-LD Product & Breadcrumb Schema
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const productJsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'image': product.images || [],
    'description': product.description || product.shortDescription || '',
    'sku': product.sku || product._id.toString(),
    'mpn': product.sku || product._id.toString(),
    'brand': {
      '@type': 'Brand',
      'name': product.brand || 'Radhika Jewellers',
    },
    'color': product.color || 'Gold',
    'material': product.material || 'Brass Alloy & Kundan',
    'weight': product.weight || undefined,
    'category': product.category?.toString() || 'Jewellery',
    'offers': {
      '@type': 'Offer',
      'url': `${baseUrl}/product/${product.slug || resolvedParams.slug}`,
      'priceCurrency': 'INR',
      'price': product.finalPrice || product.price,
      'priceValidUntil': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'Organization',
        'name': 'Radhika Jewellers',
      },
      'shippingDetails': {
        '@type': 'OfferShippingDetails',
        'shippingRate': {
          '@type': 'MonetaryAmount',
          'value': 0,
          'currency': 'INR'
        },
        'shippingDestination': {
          '@type': 'DefinedRegion',
          'addressCountry': 'IN'
        },
        'deliveryTime': {
          '@type': 'ShippingDeliveryTime',
          'handlingTime': {
            '@type': 'QuantitativeValue',
            'minValue': 1,
            'maxValue': 2,
            'unitCode': 'DAY'
          },
          'transitTime': {
            '@type': 'QuantitativeValue',
            'minValue': 2,
            'maxValue': 4,
            'unitCode': 'DAY'
          }
        }
      },
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        'applicableCountry': 'IN',
        'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
        'merchantReturnDays': 2,
        'returnMethod': 'https://schema.org/ReturnByMail',
        'returnFees': 'https://schema.org/FreeReturn'
      }
    },
  };

  if (realReviewCount > 0) {
    productJsonLd['aggregateRating'] = {
      '@type': 'AggregateRating',
      'ratingValue': Number(realAverageRating.toFixed(1)),
      'reviewCount': realReviewCount,
      'bestRating': '5',
      'worstRating': '1',
    };
    productJsonLd['review'] = dbReviews.map((r: any) => ({
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': r.userName || 'Verified Customer',
      },
      'datePublished': new Date(r.createdAt).toISOString().split('T')[0],
      'reviewBody': r.comment || '',
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': r.rating,
      },
    }));
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': baseUrl,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Shop',
        'item': `${baseUrl}/shop`,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product.name,
        'item': `${baseUrl}/product/${product.slug || resolvedParams.slug}`,
      },
    ],
  };

  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRelated = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductClient product={serializedProduct} relatedProducts={serializedRelated} />
    </>
  );
}
