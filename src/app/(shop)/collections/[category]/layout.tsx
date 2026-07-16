import { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}

const collectionDetails: Record<string, { title: string, description: string }> = {
  "bridal": {
    title: "Bridal Collection",
    description: "Exquisite pieces crafted for your special day. Make every moment unforgettable with our royal heritage designs.",
  },
  "festival": {
    title: "Festival Wear",
    description: "Vibrant designs celebrating joy and tradition. Perfect for adding a touch of glamour to your festive celebrations.",
  },
  "everyday": {
    title: "Everyday Elegance",
    description: "Subtle luxury for your daily wardrobe. Minimalist designs that make a statement without overpowering your look.",
  },
  "new-arrivals": {
    title: "New Arrivals",
    description: "Discover our latest creations. Be the first to wear our most innovative and contemporary designs.",
  },
  "best-sellers": {
    title: "Best Sellers",
    description: "Our most loved pieces by customers worldwide. Tried, tested, and adored.",
  },
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryId = resolvedParams.category;
  const collection = collectionDetails[categoryId] || {
    title: categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace("-", " "),
    description: "Explore our stunning selection of premium jewellery pieces."
  };

  const title = `${collection.title} | Radhika Jewellers`;
  const description = collection.description;

  return {
    title,
    description,
    alternates: {
      canonical: `/collections/${categoryId}`,
    },
    openGraph: {
      title,
      description,
      url: `/collections/${categoryId}`,
      type: 'website',
    },
  };
}

export default async function CollectionCategoryLayout({ children, params }: LayoutProps) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.category;
  const collection = collectionDetails[categoryId] || {
    title: categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace("-", " "),
    description: "Explore our stunning selection of premium jewellery pieces."
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": collection.title,
    "description": collection.description,
    "url": `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/collections/${categoryId}`,
    "provider": {
      "@type": "Organization",
      "name": "Radhika Jewellers"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {children}
    </>
  );
}
