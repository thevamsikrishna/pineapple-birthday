"use client";
import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState, type CSSProperties } from "react";
import { MomoFigure, MomoGradients } from "./momo/MomoFigure";

/**
 * MOMO THE MONKEY — the one canonical mascot used in every scene.
 * A layered, hand-built SVG illustration (no emoji, no external asset) driven by CSS clips
 * defined in globals.css. Same silhouette, colors and pineapple hat everywhere.
 */
export type MomoClip =
  | "idle"
  | "wave"
  | "peek"
  | "hop"
  | "surprised"
  | "dance"
  | "clap"
  | "point"
  | "party_pop"
  | "hat_drop"
  | "shake"
  | "float";

export type MomoEmotion = "happy" | "surprised" | "cheeky";

export const CLIP_DURATIONS: Record<MomoClip, number> = {
  idle: 0,
  wave: 1600,
  peek: 1100,
  hop: 900,
  surprised: 1000,
  dance: 2100,
  clap: 1920,
  point: 600,
  party_pop: 1400,
  hat_drop: 1700,
  shake: 1000,
  float: 2600,
};

export interface MomoHandle {
  play: (clip: MomoClip) => void;
}

export interface MomoMascotProps {
  size?: number;
  /** Clip to play whenever the value changes. */
  animation?: MomoClip;
  emotion?: MomoEmotion;
  flip?: boolean;
  /** Shows the hidden golden token in Momo's party hat (Pineappleverse surprise B). */
  hatToken?: boolean;
  /** Clip played when the visitor taps Momo. Defaults to "wave". */
  tapClip?: MomoClip;
  onTap?: () => void;
  label?: string;
  className?: string;
  style?: CSSProperties;
  shadow?: boolean;
  /** Keep the mascot non-interactive (decorative), e.g. inside the film. */
  decorative?: boolean;
}

export const MomoMascot = forwardRef<MomoHandle, MomoMascotProps>(function MomoMascot(
  {
    size = 160,
    animation = "idle",
    emotion = "happy",
    flip = false,
    hatToken = false,
    tapClip = "wave",
    onTap,
    label = "Momo the monkey",
    className = "",
    style,
    shadow = true,
    decorative = false,
  },
  ref,
) {
  const [clip, setClip] = useState<MomoClip>(animation);
  const [nonce, setNonce] = useState(0);
  const timer = useRef<number | null>(null);
  // Stable across server and client renders (no hydration mismatch).
  const idSuffix = `momo${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const play = useCallback((next: MomoClip) => {
    if (timer.current) window.clearTimeout(timer.current);
    setClip(next);
    setNonce((n) => n + 1);
    const d = CLIP_DURATIONS[next];
    if (d > 0) timer.current = window.setTimeout(() => setClip("idle"), d + 30);
  }, []);

  useImperativeHandle(ref, () => ({ play }), [play]);

  useEffect(() => {
    if (animation !== "idle") play(animation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animation]);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const handleTap = () => {
    if (decorative) return;
    play(tapClip);
    onTap?.();
  };

  const Wrapper = decorative ? "div" : "button";

  return (
    <Wrapper
      key={nonce}
      type={decorative ? undefined : "button"}
      className={`momo ${decorative ? "" : "momo-tappable"} ${className}`}
      data-anim={clip}
      aria-label={decorative ? undefined : `${label}. Tap for a surprise.`}
      aria-hidden={decorative || undefined}
      onClick={decorative ? undefined : handleTap}
      style={{
        width: size,
        aspectRatio: "200 / 240",
        background: "none",
        border: 0,
        padding: 0,
        transform: flip ? "scaleX(-1)" : undefined,
        ...style,
      }}
    >
      <svg viewBox="0 0 200 240" width="100%" height="100%" style={{ display: "block" }} role="img" aria-hidden="true">
        <defs>
          <MomoGradients prefix={idSuffix} />
        </defs>
        <MomoFigure prefix={idSuffix} animated emotion={emotion} hatToken={hatToken} shadow={shadow} />
      </svg>
    </Wrapper>
  );
});
