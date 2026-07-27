"use client";

import React from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useCookieConsent } from "@/frontend/context/CookieConsentContext";

export default function ConsentScripts() {
  const { consent, hasHydrated } = useCookieConsent();

  if (!hasHydrated) return null;

  const { analytics, marketing } = consent.categories;

  return (
    <>
      {/* Analytics Category: Google Analytics, Vercel Analytics & Speed Insights */}
      {analytics && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-X0J8L9TSGR"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-X0J8L9TSGR');
            `}
          </Script>
          <Analytics />
          <SpeedInsights />
        </>
      )}

      {/* Marketing Category: Placeholders for Meta Pixel or Google Ads */}
      {marketing && (
        <Script id="marketing-pixel-placeholder" strategy="afterInteractive">
          {`
            // Marketing pixel loaded conditionally upon user consent
            console.log('Marketing & Ads consent granted');
          `}
        </Script>
      )}
    </>
  );
}
