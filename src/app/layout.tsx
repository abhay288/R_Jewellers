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
  description: "Discover our premium collection of handcrafted luxury artificial jewellery. Elegance, heritage, and royal designs crafted for your special moments.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
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
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "Radhika Jewellers",
        "url": baseUrl,
        "logo": `${baseUrl}/icon.png`,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-9876543210",
          "contactType": "customer service",
          "availableLanguage": ["English", "Hindi"]
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
