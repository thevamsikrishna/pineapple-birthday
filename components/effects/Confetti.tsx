"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

export interface ConfettiHandle {
  /** Bursts confetti from a point given in 0–1 viewport fractions. */
  burst: (x?: number, y?: number, count?: number) => void;
}

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number;
  shape: "rect" | "circle";
}

const COLORS = ["#FFD75E", "#F8C86A", "#F5A8CE", "#BBA9F7", "#8FD2AF", "#FFF5DF"];

/** Lightweight capped confetti canvas. Stops itself when the burst settles. */
export const Confetti = forwardRef<ConfettiHandle, { className?: string }>(function Confetti({ className = "" }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pieces = useRef<Piece[]>([]);
  const raf = useRef(0);
  const reduced = useReducedMotion();

  const loop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const alive: Piece[] = [];
    for (const p of pieces.current) {
      p.vy += 0.18;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.006;
      if (p.life <= 0 || p.y > h + 20) continue;
      alive.push(p);
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 1.5);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)) + 1);
      else {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    pieces.current = alive;
    if (alive.length) raf.current = requestAnimationFrame(loop);
    else ctx.clearRect(0, 0, w, h);
  };

  useImperativeHandle(ref, () => ({
    burst: (fx = 0.5, fy = 0.5, count = 90) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const n = reduced ? Math.min(count, 30) : Math.min(count, 160);
      for (let i = 0; i < n; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
        const speed = 5 + Math.random() * 9;
        pieces.current.push({
          x: fx * w,
          y: fy * h,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          w: 6 + Math.random() * 6,
          h: 4 + Math.random() * 6,
          color: COLORS[i % COLORS.length],
          life: 1 + Math.random() * 0.6,
          shape: Math.random() > 0.7 ? "circle" : "rect",
        });
      }
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(loop);
    },
  }));

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
});
