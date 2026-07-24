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

    // Initialize Lenis with ultra-smooth momentum settings for luxury feel
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.6,
      infinite: false,
      autoResize: true,
    });

    lenisRef.current = lenis;

    let animationFrameId: number;

    function update(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(update);
    }

    animationFrameId = requestAnimationFrame(update);

    // Auto-recalculate scroll height when DOM dimensions change (e.g. dynamic loaded components)
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isAdmin]);

  // Reset scroll to top instantly on page route navigation
  useEffect(() => {
    if (lenisRef.current && !isAdmin) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [pathname, isAdmin]);

  return <>{children}</>;
}
