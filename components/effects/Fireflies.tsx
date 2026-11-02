"use client";
import { useMemo } from "react";

/** Soft drifting fireflies — pure CSS, cheap, decorative. */
export function Fireflies({ count = 14, color = "#FFD75E", className = "" }: { count?: number; color?: string; className?: string }) {
  const flies = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 37 + 11) % 100}%`,
        top: `${(i * 53 + 23) % 100}%`,
        delay: `${(i * 0.7) % 6}s`,
        duration: `${5 + (i % 4)}s`,
        size: 3 + (i % 3),
      })),
    [count],
  );
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {flies.map((f, i) => (
        <span
          key={i}
          className="anim-firefly absolute rounded-full"
          style={{
            left: f.left,
            top: f.top,
            width: f.size,
            height: f.size,
            background: color,
            boxShadow: `0 0 ${f.size * 3}px ${f.size}px ${color}66`,
            animationDelay: f.delay,
            animationDuration: f.duration,
          }}
        />
      ))}
    </div>
  );
}
