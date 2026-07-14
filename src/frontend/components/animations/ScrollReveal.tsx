"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/shared/lib/utils";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
}

export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 1,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    let x = 0;
    let y = 0;

    switch (direction) {
      case "up":
        y = 50;
        break;
      case "down":
        y = -50;
        break;
      case "left":
        x = 50;
        break;
      case "right":
        x = -50;
        break;
      default:
        break;
    }

    gsap.fromTo(
      el,
      {
        opacity: 0,
        x,
        y,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%", // Triggers when the top of the element hits 85% from the top of the viewport
          toggleActions: "play none none reverse",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [direction, delay, duration]);

  return (
    <div ref={elementRef} className={cn("opacity-0", className)}>
      {children}
    </div>
  );
}
