import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Curated Collections | Radhika Jewellers',
  description: 'Explore our meticulously handcrafted jewellery collections, featuring Bridal designs, Everyday Elegance, Festival Glow, and Heritage Classics.',
  alternates: {
    canonical: '/collections',
  },
  openGraph: {
    title: 'Curated Collections | Radhika Jewellers',
    description: 'Explore our meticulously handcrafted jewellery collections, featuring Bridal designs, Everyday Elegance, Festival Glow, and Heritage Classics.',
    url: '/collections',
    type: 'website',
  },
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collectionListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Curated Collections",
    "description": "Explore our meticulously handcrafted jewellery collections, featuring Bridal designs, Everyday Elegance, Festival Glow, and Heritage Classics.",
    "url": `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/collections`,
    "provider": {
      "@type": "Organization",
      "name": "Radhika Jewellers"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionListSchema) }}
      />
      {children}
    </>
  );
}
