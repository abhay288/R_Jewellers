import type { Metadata, Viewport } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import SmoothScroll from "@/frontend/components/layout/SmoothScroll";
import DiamondCursor from "@/frontend/components/layout/DiamondCursor";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AuthProvider from "@/frontend/components/providers/AuthProvider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#8c765c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Radhika Jewellers | Luxury Artificial Jewellery",
    template: "%s | Radhika Jewellers"
  },
  description: "Discover Radhika Jewellers' premium collection of handcrafted luxury artificial jewellery, Kundan sets, 22K gold plated necklaces, jhumka earrings, and bridal jewellery online.",
  keywords: [
    "Radhika Jewellers",
    "Radhika Jewellers online",
    "artificial jewellery",
    "imitation jewellery online india",
    "kundan jewellery online",
    "gold plated artificial jewellery",
    "bridal artificial jewellery set",
    "jhumka earrings online",
    "radhika jewellers howrah",
    "luxury artificial jewellery",
    "temple jewellery online"
  ].join(", "),
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://www.radhikajewellers.store'),
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Radhika Jewellers | Luxury Artificial Jewellery",
    description: "Premium handcrafted luxury artificial jewellery. Elegance crafted for you.",
    url: '/',
    siteName: 'Radhika Jewellers',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Radhika Jewellers Royal Collection'
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Radhika Jewellers | Luxury Artificial Jewellery",
    description: "Premium handcrafted luxury artificial jewellery. Elegance crafted for you.",
    images: ['/og-image.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Radhika Jewellers',
  },
  verification: {
    google: 'lrveydvWzw2CUUx-6gdxmuBZFaC1J37qZ-BL2RgE06I',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "JewelryStore",
        "@id": `${baseUrl}/#organization`,
        "name": "Radhika Jewellers",
        "alternateName": ["Radhika Jewellers Online", "Radhika Artificial Jewellery"],
        "url": baseUrl,
        "logo": `${baseUrl}/icon.png`,
        "image": `${baseUrl}/og-image.jpg`,
        "description": "Premium handcrafted artificial & imitation jewellery store. Specialising in Kundan sets, 22K gold-plated necklaces, bridal jewellery, jhumkas, and bangles.",
        "telephone": "+91-62896-79496",
        "email": "support@radhikajewellers.store",
        "priceRange": "₹₹",
        "currenciesAccepted": "INR",
        "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "51 Khagendra Nath Ganguly Lane, 4th Floor, Flat No. 402, Nandi Bagan",
          "addressLocality": "Howrah",
          "addressRegion": "West Bengal",
          "postalCode": "711106",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 22.5958,
          "longitude": 88.2636
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "10:00",
          "closes": "19:00"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-62896-79496",
          "contactType": "customer service",
          "email": "support@radhikajewellers.store",
          "availableLanguage": ["English", "Hindi", "Bengali"]
        },
        "sameAs": [
          "https://www.facebook.com/radhikajewellers",
          "https://www.instagram.com/radhikajewellers",
          "https://twitter.com/radhikajewellers"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "Radhika Jewellers",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/shop?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Where to buy high quality artificial jewellery online in India?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Radhika Jewellers (www.radhikajewellers.store) offers high quality handcrafted artificial jewellery online in India, featuring 22K gold-plated Kundan sets, bridal jewellery, jhumkas, and bangles with free pan-India shipping."
            }
          },
          {
            "@type": "Question",
            "name": "Is Radhika Jewellers artificial jewellery skin safe?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, all artificial jewellery from Radhika Jewellers is 100% skin safe, non-allergic, and free from lead, nickel, and cadmium."
            }
          },
          {
            "@type": "Question",
            "name": "What type of artificial jewellery is available at Radhika Jewellers?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Radhika Jewellers offers Kundan necklace sets, CZ diamond simulated jewellery, bridal wedding sets, temple jewellery, festival chokers, jhumka earrings, bangles, anklets, and mangalsutras."
            }
          }
        ]
      }
    ]
  };

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${outfit.variable} antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Script id="register-sw" strategy="lazyOnload">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  console.log('ServiceWorker registered with scope:', reg.scope);
                }).catch(function(err) {
                  console.error('ServiceWorker registration failed:', err);
                });
              });
            }
          `}
        </Script>
        {/* Google Analytics - Deferred lazyOnload for fast FCP/LCP */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-X0J8L9TSGR" strategy="lazyOnload" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X0J8L9TSGR');
          `}
        </Script>
      </head>
      <body className="flex flex-col font-sans bg-background text-foreground min-h-screen">
        <AuthProvider>
          <DiamondCursor />
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
