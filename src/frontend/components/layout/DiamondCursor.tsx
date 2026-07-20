"use client";

import { useEffect, useRef } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  char: string;
  rotation: number;
  rotationSpeed: number;
  color: string;
}

const SPARKLE_CHARS = ["◆", "✦", "◇", "✧", "◈", "⬥"];
const GOLD_COLORS = [
  "rgba(201,162,39,1)",
  "rgba(230,194,128,1)",
  "rgba(245,230,180,1)",
  "rgba(215,175,55,1)",
  "rgba(255,215,80,1)",
];

export default function DiamondCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const idRef = useRef(0);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    // Only on desktop
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size canvas to window
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Track mouse
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove);

    // Spawn sparkles on move
    const spawnSparkle = (x: number, y: number) => {
      const now = performance.now();
      if (now - lastSpawnRef.current < 80) return; // throttle spawning to reduce count
      lastSpawnRef.current = now;

      const count = 1; // only 1 at a time
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.8;
        const maxLife = 40 + Math.random() * 30; // slightly shorter life
        sparklesRef.current.push({
          id: idRef.current++,
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          size: 4 + Math.random() * 6, // smaller size
          opacity: 1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4, // slighter upward drift
          life: 0,
          maxLife,
          char: SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.08,
          color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
        });
      }

      // Cap particle count
      if (sparklesRef.current.length > 30) {
        sparklesRef.current = sparklesRef.current.slice(-30);
      }

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    window.addEventListener("mousemove", (e) => spawnSparkle(e.clientX, e.clientY));

    // Animation loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparklesRef.current = sparklesRef.current.filter((s) => s.life < s.maxLife);

      if (sparklesRef.current.length === 0) {
        rafRef.current = 0;
        return;
      }

      for (const s of sparklesRef.current) {
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.015; // gentle gravity
        s.rotation += s.rotationSpeed;

        const progress = s.life / s.maxLife;
        // Fade in quickly, fade out slowly
        s.opacity = progress < 0.2
          ? progress / 0.2
          : 1 - (progress - 0.2) / 0.8;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.globalAlpha = s.opacity * 0.15; // barely visible
        ctx.font = `${s.size}px serif`;
        ctx.fillStyle = s.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Subtle glow
        ctx.shadowColor = "rgba(201,162,39,0.1)"; // minimal glow
        ctx.shadowBlur = 2;
        ctx.fillText(s.char, 0, 0);

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-9998"
      aria-hidden="true"
    />
  );
}
