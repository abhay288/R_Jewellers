"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    // Skip Lenis on Admin routes to preserve native click and scroll performance in fixed overflow panels
    if (isAdmin) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    // Initialize Lenis with ultra-smooth momentum settings for storefront luxury feel
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    let animationFrameId: number;

    function update(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(update);
    }

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isAdmin]);

  // Reset scroll to top instantly on page route navigation
  useEffect(() => {
    if (lenisRef.current && !isAdmin) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname, isAdmin]);

  return <>{children}</>;
}
