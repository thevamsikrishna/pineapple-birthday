"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface Star {
  x: number;
  y: number;
  r: number;
  tw: number;
  phase: number;
  depth: number;
}

/** Twinkling parallax starfield with occasional shooting stars (Canvas 2D, capped cost). */
export function StarField({ density = 1, shooting = true, className = "" }: { density?: number; shooting?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let shoot: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShoot = performance.now() + 3000;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(220, Math.floor((w * h) / 6000) * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.8 + 0.2,
      }));
    };

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / w - 0.5) * 2;
      target.y = (e.clientY / h - 0.5) * 2;
    };

    const draw = (now: number) => {
      pointer = { x: pointer.x + (target.x - pointer.x) * 0.04, y: pointer.y + (target.y - pointer.y) * 0.04 };
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      for (const s of stars) {
        const a = reduced ? 0.8 : 0.5 + 0.5 * Math.sin(t * s.tw + s.phase);
        const px = s.x + pointer.x * 14 * s.depth;
        const py = s.y + pointer.y * 10 * s.depth;
        ctx.globalAlpha = 0.25 + a * 0.75;
        ctx.fillStyle = s.depth > 0.7 ? "#FFF5DF" : "#D8CDFB";
        ctx.beginPath();
        ctx.arc(px, py, s.r * (0.8 + a * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (shooting && !reduced) {
        if (!shoot && now > nextShoot) {
          shoot = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.3, vx: 9, vy: 4, life: 1 };
          nextShoot = now + 4000 + Math.random() * 6000;
        }
        if (shoot) {
          shoot.x += shoot.vx;
          shoot.y += shoot.vy;
          shoot.life -= 0.02;
          const grad = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 10, shoot.y - shoot.vy * 10);
          grad.addColorStop(0, `rgba(255,245,223,${shoot.life})`);
          grad.addColorStop(1, "rgba(255,245,223,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(shoot.x, shoot.y);
          ctx.lineTo(shoot.x - shoot.vx * 10, shoot.y - shoot.vy * 10);
          ctx.stroke();
          if (shoot.life <= 0) shoot = null;
        }
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [density, shooting, reduced]);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
}
