"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { audio } from "@/lib/audioController";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}
interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number }[];
}

const PALETTE = ["#FFD75E", "#F8C86A", "#BBA9F7", "#D8CDFB", "#F5A8CE", "#FFF5DF"];

/**
 * Gold-and-lavender fireworks. Runs a bounded show (default ~7 s, 9 rockets) and then
 * stops rendering entirely so it never burns battery in the background.
 */
export function Fireworks({ active, durationMs = 7000, onDone }: { active: boolean; durationMs?: number; onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];
    const start = performance.now();
    let raf = 0;
    let launched = 0;
    const maxRockets = reduced ? 4 : 9;
    let nextLaunch = start;
    let finished = false;

    const explode = (x: number, y: number, color: string) => {
      const n = reduced ? 40 : 90;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.2;
        const sp = 2 + Math.random() * 4.5;
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, color: Math.random() > 0.75 ? "#FFF5DF" : color, size: 1.5 + Math.random() * 1.5 });
      }
      audio.sfx("firework");
    };

    const frame = (now: number) => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      if (launched < maxRockets && now >= nextLaunch) {
        launched++;
        nextLaunch = now + 450 + Math.random() * 500;
        const color = PALETTE[launched % PALETTE.length];
        rockets.push({ x: w * (0.2 + Math.random() * 0.6), y: h, vy: -(9 + Math.random() * 3), targetY: h * (0.18 + Math.random() * 0.3), color, trail: [] });
      }
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        if (reduced) {
          explode(r.x, r.targetY, r.color);
          rockets.splice(i, 1);
          continue;
        }
        r.y += r.vy;
        r.vy += 0.08;
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 8) r.trail.shift();
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        r.trail.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
        if (r.y <= r.targetY || r.vy >= 0) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vx *= 0.97;
        s.vy = s.vy * 0.97 + 0.06;
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.014;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      const elapsed = now - start;
      if (elapsed < durationMs || rockets.length || sparks.length) raf = requestAnimationFrame(frame);
      else {
        finished = true;
        ctx.clearRect(0, 0, w, h);
        onDoneRef.current?.();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      if (!finished) ctx.clearRect(0, 0, w, h);
    };
  }, [active, durationMs, reduced]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
