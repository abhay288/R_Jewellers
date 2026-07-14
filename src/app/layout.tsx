import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import SmoothScroll from "@/frontend/components/layout/SmoothScroll";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Radhika Jewellers | Luxury Artificial Jewellery",
  description: "Discover our premium collection of luxury artificial jewellery. Elegance crafted for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${outfit.variable} antialiased`}
    >
      <body className="flex flex-col font-sans bg-background text-foreground min-h-screen">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
