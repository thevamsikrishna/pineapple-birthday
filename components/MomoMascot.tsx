"use client";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type CSSProperties } from "react";

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

let uid = 0;

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
  const [idSuffix] = useState(() => `momo-${++uid}`);

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

  const surprised = emotion === "surprised";
  const eyeScale = surprised ? 1.18 : 1;
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
          <radialGradient id={`${idSuffix}-fur`} cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#D1945B" />
            <stop offset="60%" stopColor="#B4723A" />
            <stop offset="100%" stopColor="#8F5629" />
          </radialGradient>
          <radialGradient id={`${idSuffix}-cream`} cx="40%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#FFF9EC" />
            <stop offset="100%" stopColor="#F3DFC0" />
          </radialGradient>
          <linearGradient id={`${idSuffix}-hat`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE58F" />
            <stop offset="100%" stopColor="#F2B443" />
          </linearGradient>
          <linearGradient id={`${idSuffix}-leaf`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#6FBF93" />
            <stop offset="100%" stopColor="#A6E3C3" />
          </linearGradient>
          <pattern id={`${idSuffix}-hatch`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M0 0H9" stroke="#D99A2C" strokeWidth="1.1" opacity="0.7" />
            <path d="M0 0V9" stroke="#D99A2C" strokeWidth="1.1" opacity="0.7" />
          </pattern>
        </defs>

        {shadow && <ellipse cx="100" cy="232" rx="44" ry="7" fill="#0E0D22" opacity="0.25" />}

        {/* tail */}
        <path
          className="momo-tail"
          d="M146 188 C186 184 196 148 170 134 C158 128 150 140 158 148"
          fill="none"
          stroke="#A0652F"
          strokeWidth="11"
          strokeLinecap="round"
        />

        <g className="momo-body-group">
          {/* legs */}
          <ellipse cx="76" cy="218" rx="18" ry="13" fill="#9A6230" />
          <ellipse cx="124" cy="218" rx="18" ry="13" fill="#9A6230" />
          <ellipse cx="72" cy="222" rx="12" ry="8" fill="#F3DFC0" />
          <ellipse cx="128" cy="222" rx="12" ry="8" fill="#F3DFC0" />
          {/* body */}
          <ellipse cx="100" cy="172" rx="44" ry="50" fill={`url(#${idSuffix}-fur)`} />
          <ellipse cx="100" cy="180" rx="27" ry="34" fill={`url(#${idSuffix}-cream)`} />
          {/* arms */}
          <g className="momo-arm-l">
            <path d="M68 150 C50 165 44 180 50 196" fill="none" stroke="#B4723A" strokeWidth="14" strokeLinecap="round" />
            <circle cx="50" cy="198" r="10" fill="#F3DFC0" />
          </g>
          <g className="momo-arm-r">
            <path d="M132 150 C150 165 156 180 150 196" fill="none" stroke="#B4723A" strokeWidth="14" strokeLinecap="round" />
            <circle cx="150" cy="198" r="10" fill="#F3DFC0" />
          </g>
        </g>

        <g className="momo-head-group">
          {/* ears */}
          <circle cx="48" cy="102" r="19" fill="#A0652F" />
          <circle cx="152" cy="102" r="19" fill="#A0652F" />
          <circle cx="50" cy="103" r="10" fill="#F3C9B0" />
          <circle cx="150" cy="103" r="10" fill="#F3C9B0" />
          {/* head */}
          <circle cx="100" cy="106" r="52" fill={`url(#${idSuffix}-fur)`} />
          {/* tuft */}
          <path d="M98 56 C92 44 104 36 108 48" fill="none" stroke="#8F5629" strokeWidth="6" strokeLinecap="round" />
          {/* face mask */}
          <circle cx="80" cy="104" r="25" fill={`url(#${idSuffix}-cream)`} />
          <circle cx="120" cy="104" r="25" fill={`url(#${idSuffix}-cream)`} />
          <ellipse cx="100" cy="122" rx="33" ry="25" fill={`url(#${idSuffix}-cream)`} />
          {/* cheeks */}
          <circle cx="70" cy="120" r="7" fill="#F5A8CE" opacity="0.55" />
          <circle cx="130" cy="120" r="7" fill="#F5A8CE" opacity="0.55" />
          {/* eyes */}
          <g transform={`translate(84 103) scale(${eyeScale}) translate(-84 -103)`}>
            <circle cx="84" cy="103" r="10" fill="#29223D" />
            <circle cx="87.5" cy="99.5" r="3.6" fill="#fff" />
            <circle cx="81" cy="107" r="1.6" fill="#fff" opacity="0.8" />
          </g>
          <g transform={`translate(116 103) scale(${eyeScale}) translate(-116 -103)`}>
            <circle cx="116" cy="103" r="10" fill="#29223D" />
            <circle cx="119.5" cy="99.5" r="3.6" fill="#fff" />
            <circle cx="113" cy="107" r="1.6" fill="#fff" opacity="0.8" />
          </g>
          {/* eyelids (blink) */}
          <rect className="momo-eyelid" x="73" y="92" width="22" height="22" rx="9" fill="#F3DFC0" />
          <rect className="momo-eyelid delay" x="105" y="92" width="22" height="22" rx="9" fill="#F3DFC0" />
          {emotion === "cheeky" && <rect x="105" y="92" width="22" height="11" rx="6" fill="#F3DFC0" />}
          {/* nose + mouth */}
          <ellipse cx="100" cy="118" rx="4.2" ry="3" fill="#8F5629" />
          <path d="M89 127 Q100 138 111 127" fill="none" stroke="#29223D" strokeWidth="2.6" strokeLinecap="round" />
          <ellipse className="momo-mouth-o" cx="100" cy="130" rx="5" ry="7" fill="#29223D" style={surprised ? { opacity: 1 } : undefined} />
          {surprised && <ellipse cx="100" cy="130" rx="5" ry="7" fill="#29223D" />}
          {/* hat: pineapple party hat */}
          <g className="momo-hat">
            <g transform="rotate(-14 100 62)">
              <path d="M100 18 C96 28 92 36 90 44 M100 18 C104 28 108 36 110 44 M100 20 C100 30 100 38 100 44" stroke="#6FBF93" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M100 14 C88 24 86 36 95 46 C104 36 108 24 100 14Z" fill={`url(#${idSuffix}-leaf)`} />
              <path d="M100 16 C112 24 114 36 104 46 C96 36 92 24 100 16Z" fill="#8FD2AF" opacity="0.9" />
              <path d="M78 78 L100 30 L122 78 Z" fill={`url(#${idSuffix}-hat)`} />
              <path d="M78 78 L100 30 L122 78 Z" fill={`url(#${idSuffix}-hatch)`} />
              <path d="M76 78 Q100 70 124 78 Q100 86 76 78Z" fill="#F5A8CE" />
              {hatToken && (
                <g className="anim-pop-in">
                  <circle cx="100" cy="52" r="9" fill="#FFD75E" stroke="#D99A2C" strokeWidth="1.5" />
                  <path d="M100 46 L101.8 50.2 L106 50.5 L102.8 53.3 L103.8 57.5 L100 55.2 L96.2 57.5 L97.2 53.3 L94 50.5 L98.2 50.2 Z" fill="#fff" opacity="0.9" />
                </g>
              )}
            </g>
          </g>
        </g>
      </svg>
    </Wrapper>
  );
});
