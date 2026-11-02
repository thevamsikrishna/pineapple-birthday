"use client";
import { useEffect, useMemo } from "react";
import type { TransitionKind } from "@/lib/sceneMachine";
import { useReducedMotion } from "@/lib/useReducedMotion";

const STYLE: Record<Exclude<TransitionKind, "none">, { color: string; glow: string; ms: number }> = {
  sparkles: { color: "#F8C86A", glow: "#FFF5DF", ms: 900 },
  "pineapple-portal": { color: "#FFD75E", glow: "#8FD2AF", ms: 800 },
  "gold-light": { color: "#FFE9B3", glow: "#F8C86A", ms: 850 },
  "firework-wipe": { color: "#BBA9F7", glow: "#FFD75E", ms: 900 },
};

/**
 * Full-screen scene-change choreography: a glowing circle expands from the centre with a
 * ring of sparkles, then dissolves to reveal the next scene. Reduced motion = quick fade.
 */
export function SparkleTransition({ kind, onDone }: { kind: TransitionKind; onDone: () => void }) {
  const reduced = useReducedMotion();
  const cfg = kind === "none" ? null : STYLE[kind];
  const sparkles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        angle: (i / 26) * 360,
        dist: 28 + ((i * 17) % 23),
        size: 4 + (i % 4) * 2,
        delay: (i % 6) * 40,
      })),
    [],
  );

  useEffect(() => {
    if (!cfg) return;
    const t = window.setTimeout(onDone, reduced ? 200 : cfg.ms);
    return () => window.clearTimeout(t);
  }, [cfg, onDone, reduced]);

  if (!cfg) return null;
  const ms = reduced ? 200 : cfg.ms;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes px-wipe { 0% { clip-path: circle(0% at 50% 55%); opacity: 1; } 55% { clip-path: circle(85% at 50% 55%); opacity: 1; } 100% { clip-path: circle(85% at 50% 55%); opacity: 0; } }
        @keyframes px-spark { 0% { transform: rotate(var(--a)) translateY(0) scale(0); opacity: 0; } 30% { opacity: 1; } 100% { transform: rotate(var(--a)) translateY(calc(var(--d) * -1vmin)) scale(1); opacity: 0; } }
        @keyframes px-fade { 0% { opacity: 0; } 40% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 55%, ${cfg.glow} 0%, ${cfg.color} 35%, ${cfg.color}cc 60%, transparent 100%)`,
          animation: `${reduced ? "px-fade" : "px-wipe"} ${ms}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
        }}
      />
      {!reduced && (
        <div className="absolute left-1/2 top-[55%]">
          {sparkles.map((s, i) => (
            <span
              key={i}
              className="absolute block rounded-full"
              style={
                {
                  "--a": `${s.angle}deg`,
                  "--d": s.dist,
                  width: s.size,
                  height: s.size,
                  marginLeft: -s.size / 2,
                  marginTop: -s.size / 2,
                  background: i % 3 ? cfg.glow : cfg.color,
                  boxShadow: `0 0 ${s.size * 2}px ${cfg.glow}`,
                  animation: `px-spark ${ms}ms ease-out ${s.delay}ms forwards`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
