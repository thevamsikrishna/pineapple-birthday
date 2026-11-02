"use client";
import { useEffect, useMemo, useState, type RefObject } from "react";

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Maps SVG viewBox coordinates to CSS pixels inside a container, for an <svg> that fills the
 * container with preserveAspectRatio "xMidYMid slice" (default) or "meet". Lets HTML hit targets
 * (buttons ≥ 44px, focusable) sit exactly on top of drawn objects at any viewport size.
 */
export function useViewBoxMapping(ref: RefObject<HTMLElement | null>, vb: ViewBox, mode: "slice" | "meet" = "slice") {
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setBox((prev) => (prev.w === r.width && prev.h === r.height ? prev : { w: r.width, h: r.height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return useMemo(() => {
    const scale = box.w === 0 ? 0 : mode === "slice" ? Math.max(box.w / vb.w, box.h / vb.h) : Math.min(box.w / vb.w, box.h / vb.h);
    const ox = (box.w - vb.w * scale) / 2 - vb.x * scale;
    const oy = (box.h - vb.h * scale) / 2 - vb.y * scale;
    const map = (x: number, y: number) => ({ left: ox + x * scale, top: oy + y * scale });
    /** Pixel size for a width/height given in viewBox units, never below `min` px. */
    const px = (units: number, min = 0) => Math.max(min, units * scale);
    return { map, px, scale, ready: box.w > 0 };
  }, [box.w, box.h, vb.x, vb.y, vb.w, vb.h, mode]);
}
