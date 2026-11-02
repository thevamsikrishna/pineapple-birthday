/**
 * The film cast and props — original, stylized SVG illustrations sharing one visual grammar
 * (rounded silhouettes, big highlight eyes, pastel gradients, soft shadows). Every component
 * renders a <g> whose origin is at the character's feet so it can be placed with translate().
 * All poses are plain props so the same art can be driven by time (film) or by CSS (scenes).
 */
import type { ReactNode } from "react";
import { MomoFigure, MomoGradients } from "../momo/MomoFigure";
import type { MomoPose } from "../momo/types";

export const PALETTE = {
  skin: "#F7D2B8",
  skinShade: "#E9B798",
  hair: "#3B2A3F",
  lavender: "#BBA9F7",
  lavenderDeep: "#9C87E8",
  peach: "#FFD1B0",
  peachDeep: "#F6B48B",
  cream: "#FFF5DF",
  plum: "#29223D",
  pink: "#F5A8CE",
  mint: "#8FD2AF",
  honey: "#F8C86A",
  pineapple: "#FFD75E",
};

export const Defs = ({ prefix = "cast" }: { prefix?: string }) => (
  <defs>
    <MomoGradients prefix={`${prefix}-momo`} />
    <linearGradient id={`${prefix}-skirt`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFE1C9" />
      <stop offset="100%" stopColor={PALETTE.peachDeep} />
    </linearGradient>
    <linearGradient id={`${prefix}-bodice`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#D5C8FF" />
      <stop offset="100%" stopColor={PALETTE.lavenderDeep} />
    </linearGradient>
    <linearGradient id={`${prefix}-cake-bottom`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFE3EE" />
      <stop offset="100%" stopColor="#F5B7D2" />
    </linearGradient>
    <linearGradient id={`${prefix}-cake-top`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#E6DDFF" />
      <stop offset="100%" stopColor="#C4B3F7" />
    </linearGradient>
    <radialGradient id={`${prefix}-flame`} cx="50%" cy="70%" r="60%">
      <stop offset="0%" stopColor="#FFF9D6" />
      <stop offset="45%" stopColor="#FFD75E" />
      <stop offset="100%" stopColor="#FF9A3C" stopOpacity="0.9" />
    </radialGradient>
    <radialGradient id={`${prefix}-fur`} cx="38%" cy="30%" r="80%">
      <stop offset="0%" stopColor="#D1945B" />
      <stop offset="60%" stopColor="#B4723A" />
      <stop offset="100%" stopColor="#8F5629" />
    </radialGradient>
    <radialGradient id={`${prefix}-creamfur`} cx="40%" cy="30%" r="80%">
      <stop offset="0%" stopColor="#FFF9EC" />
      <stop offset="100%" stopColor="#F3DFC0" />
    </radialGradient>
    <linearGradient id={`${prefix}-hat`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFE58F" />
      <stop offset="100%" stopColor="#F2B443" />
    </linearGradient>
    <linearGradient id={`${prefix}-leaf`} x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stopColor="#6FBF93" />
      <stop offset="100%" stopColor="#A6E3C3" />
    </linearGradient>
    <pattern id={`${prefix}-hatch`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="M0 0H9" stroke="#D99A2C" strokeWidth="1.1" opacity="0.7" />
      <path d="M0 0V9" stroke="#D99A2C" strokeWidth="1.1" opacity="0.7" />
    </pattern>
    <linearGradient id={`${prefix}-trunk`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#8E5A3C" />
      <stop offset="100%" stopColor="#B57A52" />
    </linearGradient>
    <radialGradient id={`${prefix}-canopy-pink`} cx="40%" cy="30%" r="75%">
      <stop offset="0%" stopColor="#FFD9EA" />
      <stop offset="100%" stopColor="#F29CC3" />
    </radialGradient>
    <radialGradient id={`${prefix}-canopy-mint`} cx="40%" cy="30%" r="75%">
      <stop offset="0%" stopColor="#C5F0D8" />
      <stop offset="100%" stopColor="#6FBF93" />
    </radialGradient>
    <radialGradient id={`${prefix}-canopy-lav`} cx="40%" cy="30%" r="75%">
      <stop offset="0%" stopColor="#E6DDFF" />
      <stop offset="100%" stopColor="#A08BEE" />
    </radialGradient>
    <linearGradient id={`${prefix}-balloon`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#FFF0A8" />
      <stop offset="100%" stopColor="#F2B443" />
    </linearGradient>
    <linearGradient id={`${prefix}-gift`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#D5C8FF" />
      <stop offset="100%" stopColor="#9C87E8" />
    </linearGradient>
  </defs>
);

/* ─────────────────────────── Eyes shared by the cast ─────────────────────────── */
export function Eye({ x, y, r = 6, scale = 1, closed = false }: { x: number; y: number; r?: number; scale?: number; closed?: boolean }) {
  if (closed)
    return <path d={`M${x - r} ${y} Q${x} ${y + r * 0.9} ${x + r} ${y}`} fill="none" stroke={PALETTE.plum} strokeWidth={r * 0.35} strokeLinecap="round" />;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`}>
      <circle cx={x} cy={y} r={r} fill={PALETTE.plum} />
      <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.36} fill="#fff" />
      <circle cx={x - r * 0.3} cy={y + r * 0.4} r={r * 0.16} fill="#fff" opacity="0.8" />
    </g>
  );
}

/* ─────────────────────────── The birthday girl (fictional, stylized) ─────────────────────────── */
export interface GirlProps {
  prefix?: string;
  /** Right-arm rotation in degrees. 0 = resting; -120 = raised; -60 = reaching into the cake. */
  armAngle?: number;
  leftArmAngle?: number;
  holdingKnife?: boolean;
  expression?: "smile" | "joy" | "focus";
  bob?: number; // vertical walk bob offset
  lean?: number; // forward lean degrees
}

export function Girl({ prefix = "cast", armAngle = 0, leftArmAngle = 0, holdingKnife = false, expression = "smile", bob = 0, lean = 0 }: GirlProps) {
  const eyesClosed = expression === "joy";
  return (
    <g transform={`translate(0 ${bob}) rotate(${lean} 0 -130)`}>
      <ellipse cx="0" cy="2" rx="44" ry="8" fill="#0E0D22" opacity="0.18" />
      {/* legs + shoes */}
      <rect x="-17" y="-90" width="13" height="84" rx="6" fill={PALETTE.skin} />
      <rect x="4" y="-90" width="13" height="84" rx="6" fill={PALETTE.skin} />
      <ellipse cx="-10" cy="-4" rx="13" ry="6" fill={PALETTE.lavenderDeep} />
      <ellipse cx="11" cy="-4" rx="13" ry="6" fill={PALETTE.lavenderDeep} />
      {/* hair back */}
      <circle cx="0" cy="-252" r="46" fill={PALETTE.hair} />
      <circle cx="0" cy="-296" r="17" fill={PALETTE.hair} />
      {/* skirt */}
      <path d="M-66 -18 Q0 -4 66 -18 L34 -132 L-34 -132 Z" fill={`url(#${prefix}-skirt)`} />
      <path d="M-56 -22 Q-30 -60 -22 -128" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" fill="none" />
      {/* bodice */}
      <path d="M-34 -132 L-36 -196 Q0 -208 36 -196 L34 -132 Z" fill={`url(#${prefix}-bodice)`} />
      <path d="M-40 -136 Q0 -124 40 -136 L40 -122 Q0 -110 -40 -122Z" fill={PALETTE.pink} />
      {/* left arm */}
      <g transform={`rotate(${leftArmAngle} -38 -182)`}>
        <path d="M-38 -182 C-50 -160 -52 -140 -48 -118" stroke={PALETTE.skin} strokeWidth="13" strokeLinecap="round" fill="none" />
        <circle cx="-48" cy="-118" r="8.5" fill={PALETTE.skin} />
        <circle cx="-38" cy="-188" r="15" fill={`url(#${prefix}-bodice)`} />
      </g>
      {/* neck + head */}
      <rect x="-9" y="-214" width="18" height="24" rx="7" fill={PALETTE.skinShade} />
      <circle cx="0" cy="-242" r="40" fill={PALETTE.skin} />
      {/* bangs */}
      <path d="M-40 -246 Q-28 -296 0 -290 Q28 -296 40 -246 Q24 -268 6 -262 Q-4 -270 -18 -258 Q-30 -252 -40 -246Z" fill={PALETTE.hair} />
      {/* flower in hair */}
      <g transform="translate(26 -282)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-7" rx="4" ry="7" fill={PALETTE.pink} transform={`rotate(${a})`} />
        ))}
        <circle r="3.5" fill={PALETTE.pineapple} />
      </g>
      {/* face */}
      <Eye x={-14} y={-244} r={6.5} closed={eyesClosed} />
      <Eye x={14} y={-244} r={6.5} closed={eyesClosed} />
      <path d="M-22 -254 Q-14 -258 -6 -254" stroke={PALETTE.hair} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M6 -254 Q14 -258 22 -254" stroke={PALETTE.hair} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="-24" cy="-230" r="6" fill={PALETTE.pink} opacity="0.55" />
      <circle cx="24" cy="-230" r="6" fill={PALETTE.pink} opacity="0.55" />
      {expression === "joy" ? (
        <path d="M-9 -224 Q0 -210 9 -224 Z" fill="#B8445F" />
      ) : expression === "focus" ? (
        <path d="M-6 -222 Q0 -219 6 -222" stroke="#B8445F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M-9 -224 Q0 -214 9 -224" stroke="#B8445F" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      )}
      {/* right arm (drives the cake cut) */}
      <g transform={`rotate(${armAngle} 38 -182)`}>
        <circle cx="38" cy="-188" r="15" fill={`url(#${prefix}-bodice)`} />
        <path d="M38 -182 C50 -160 54 -140 50 -118" stroke={PALETTE.skin} strokeWidth="13" strokeLinecap="round" fill="none" />
        <circle cx="50" cy="-118" r="8.5" fill={PALETTE.skin} />
        {holdingKnife && (
          <g transform="translate(50 -118) rotate(20)">
            <rect x="-5" y="-14" width="10" height="26" rx="4" fill="#5E3A2A" />
            <path d="M-4 12 L4 12 L6 70 Q0 82 -6 70 Z" fill="#E8EEF5" stroke="#B8C3D1" strokeWidth="1" />
            <path d="M0 14 L1 68" stroke="#fff" strokeWidth="1.2" opacity="0.8" />
          </g>
        )}
      </g>
    </g>
  );
}

/* ─────────────────────────── Bunny ─────────────────────────── */
export function Bunny({ hop = 0, glare = false, flower = false, facing = 1 }: { hop?: number; glare?: boolean; flower?: boolean; facing?: 1 | -1 }) {
  return (
    <g transform={`scale(${facing} 1) translate(0 ${-hop})`}>
      <ellipse cx="0" cy="2" rx="30" ry="6" fill="#0E0D22" opacity="0.18" />
      <ellipse cx="-24" cy="-26" r="11" fill="#fff" />
      <ellipse cx="0" cy="-36" rx="30" ry="30" fill={PALETTE.cream} />
      <ellipse cx="0" cy="-30" rx="18" ry="20" fill="#fff" opacity="0.6" />
      <ellipse cx="-12" cy="-6" rx="13" ry="7" fill="#FBE9D2" />
      <ellipse cx="12" cy="-6" rx="13" ry="7" fill="#FBE9D2" />
      {/* ears */}
      <ellipse cx="-12" cy="-118" rx="9" ry="30" fill={PALETTE.cream} transform="rotate(-10 -12 -118)" />
      <ellipse cx="12" cy="-118" rx="9" ry="30" fill={PALETTE.cream} transform="rotate(10 12 -118)" />
      <ellipse cx="-12" cy="-118" rx="4.5" ry="22" fill={PALETTE.pink} opacity="0.8" transform="rotate(-10 -12 -118)" />
      <ellipse cx="12" cy="-118" rx="4.5" ry="22" fill={PALETTE.pink} opacity="0.8" transform="rotate(10 12 -118)" />
      <circle cx="0" cy="-78" r="27" fill={PALETTE.cream} />
      <Eye x={-10} y={-80} r={5} />
      <Eye x={10} y={-80} r={5} />
      {glare && (
        <>
          <path d="M-18 -92 L-4 -86" stroke={PALETTE.plum} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M18 -92 L4 -86" stroke={PALETTE.plum} strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="0" cy="-69" rx="3.5" ry="2.5" fill={PALETTE.pink} />
      <path d="M-5 -64 Q0 -59 5 -64" stroke={PALETTE.plum} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="-17" cy="-68" r="4.5" fill={PALETTE.pink} opacity="0.5" />
      <circle cx="17" cy="-68" r="4.5" fill={PALETTE.pink} opacity="0.5" />
      {flower && (
        <g transform="translate(26 -44)">
          <path d="M0 0 L0 -22" stroke={PALETTE.mint} strokeWidth="3" strokeLinecap="round" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-30" rx="4" ry="7" fill={PALETTE.lavender} transform={`rotate(${a} 0 -24)`} />
          ))}
          <circle cx="0" cy="-24" r="3.5" fill={PALETTE.pineapple} />
        </g>
      )}
    </g>
  );
}

/* ─────────────────────────── Baby deer ─────────────────────────── */
export function Deer({ facing = 1, bob = 0 }: { facing?: 1 | -1; bob?: number }) {
  return (
    <g transform={`scale(${facing} 1) translate(0 ${bob})`}>
      <ellipse cx="0" cy="2" rx="46" ry="7" fill="#0E0D22" opacity="0.18" />
      {[-26, -10, 12, 28].map((x, i) => (
        <rect key={i} x={x - 5} y="-60" width="10" height="62" rx="5" fill={i % 2 ? "#C98F5B" : "#D9A066"} />
      ))}
      <ellipse cx="0" cy="-70" rx="44" ry="30" fill="#D9A066" />
      <ellipse cx="4" cy="-62" rx="26" ry="16" fill="#F3D9B8" />
      {[[-14, -84], [4, -90], [20, -80], [-4, -74]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#FFF5DF" />
      ))}
      <path d="M34 -82 C50 -100 50 -124 44 -138" stroke="#D9A066" strokeWidth="20" strokeLinecap="round" fill="none" />
      <circle cx="46" cy="-142" r="22" fill="#D9A066" />
      <ellipse cx="58" cy="-132" rx="14" ry="10" fill="#F3D9B8" />
      <ellipse cx="68" cy="-134" rx="4.5" ry="3.5" fill={PALETTE.plum} />
      <ellipse cx="30" cy="-162" rx="7" ry="13" fill="#D9A066" transform="rotate(-25 30 -162)" />
      <ellipse cx="60" cy="-162" rx="7" ry="13" fill="#D9A066" transform="rotate(25 60 -162)" />
      <ellipse cx="30" cy="-162" rx="3.5" ry="8" fill={PALETTE.pink} opacity="0.7" transform="rotate(-25 30 -162)" />
      <ellipse cx="60" cy="-162" rx="3.5" ry="8" fill={PALETTE.pink} opacity="0.7" transform="rotate(25 60 -162)" />
      <Eye x={40} y={-146} r={5.5} />
      <circle cx="52" cy="-120" r="4" fill={PALETTE.pink} opacity="0.45" />
      <path d="M-44 -74 Q-54 -78 -52 -66" stroke="#D9A066" strokeWidth="8" strokeLinecap="round" fill="none" />
    </g>
  );
}

/* ─────────────────────────── Kitten ─────────────────────────── */
export function Kitten({ facing = 1, tailWag = 0 }: { facing?: 1 | -1; tailWag?: number }) {
  return (
    <g transform={`scale(${facing} 1)`}>
      <ellipse cx="0" cy="2" rx="32" ry="6" fill="#0E0D22" opacity="0.18" />
      <path d="M-26 -20 C-56 -28 -60 -62 -40 -72" stroke="#C9BFE3" strokeWidth="11" strokeLinecap="round" fill="none" transform={`rotate(${tailWag} -26 -20)`} />
      <ellipse cx="0" cy="-30" rx="30" ry="26" fill="#C9BFE3" />
      <ellipse cx="0" cy="-22" rx="16" ry="14" fill="#F1ECFF" />
      <ellipse cx="-14" cy="-6" rx="10" ry="6" fill="#D9D1F0" />
      <ellipse cx="14" cy="-6" rx="10" ry="6" fill="#D9D1F0" />
      <path d="M-22 -62 L-16 -92 L2 -70 Z" fill="#C9BFE3" />
      <path d="M22 -62 L16 -92 L-2 -70 Z" fill="#C9BFE3" />
      <path d="M-18 -66 L-15 -84 L-5 -70 Z" fill={PALETTE.pink} opacity="0.7" />
      <path d="M18 -66 L15 -84 L5 -70 Z" fill={PALETTE.pink} opacity="0.7" />
      <circle cx="0" cy="-64" r="25" fill="#C9BFE3" />
      <path d="M-12 -86 Q-8 -78 -4 -86 M4 -86 Q8 -78 12 -86" stroke="#AFA2D2" strokeWidth="2" fill="none" />
      <Eye x={-10} y={-66} r={5.5} />
      <Eye x={10} y={-66} r={5.5} />
      <path d="M-3 -56 L3 -56 L0 -52 Z" fill={PALETTE.pink} />
      <path d="M0 -52 Q-4 -46 -8 -50 M0 -52 Q4 -46 8 -50" stroke={PALETTE.plum} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M-28 -56 L-16 -54 M-28 -50 L-16 -51 M28 -56 L16 -54 M28 -50 L16 -51" stroke="#8C80B0" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

/* ─────────────────────────── Bird ─────────────────────────── */
export function Bird({ color = PALETTE.mint, flap = 0, facing = 1 }: { color?: string; flap?: number; facing?: 1 | -1 }) {
  return (
    <g transform={`scale(${facing} 1)`}>
      <ellipse cx="0" cy="0" rx="14" ry="11" fill={color} />
      <circle cx="12" cy="-8" r="9" fill={color} />
      <path d="M20 -8 L28 -6 L20 -3 Z" fill={PALETTE.honey} />
      <circle cx="14" cy="-10" r="2.4" fill={PALETTE.plum} />
      <circle cx="15" cy="-10.8" r="0.9" fill="#fff" />
      <path d={`M-4 -2 Q-12 ${-16 - flap * 14} -22 ${-2 - flap * 6}`} stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M-13 2 L-24 6 L-22 -2 Z" fill={color} opacity="0.85" />
    </g>
  );
}

/* ─────────────────────────── Squirrel ─────────────────────────── */
export function Squirrel({ facing = 1, dance = 0 }: { facing?: 1 | -1; dance?: number }) {
  return (
    <g transform={`scale(${facing} 1) rotate(${dance})`}>
      <path d="M-14 -20 C-56 -30 -60 -90 -26 -100 C-2 -106 -10 -70 -24 -60" fill="#C8692E" />
      <path d="M-22 -34 C-46 -44 -46 -82 -26 -88" stroke="#E08A4E" strokeWidth="8" strokeLinecap="round" fill="none" />
      <ellipse cx="0" cy="-30" rx="21" ry="26" fill="#C8692E" />
      <ellipse cx="2" cy="-26" rx="12" ry="16" fill="#F6D6B6" />
      <circle cx="4" cy="-64" r="17" fill="#C8692E" />
      <ellipse cx="12" cy="-58" rx="9" ry="7" fill="#F6D6B6" />
      <ellipse cx="-4" cy="-80" rx="5" ry="8" fill="#C8692E" />
      <ellipse cx="12" cy="-80" rx="5" ry="8" fill="#C8692E" />
      <Eye x={2} y={-66} r={4.5} />
      <circle cx="19" cy="-58" r="2.2" fill={PALETTE.plum} />
      <circle cx="10" cy="-36" r="7" fill="#9C6B3F" />
      <ellipse cx="10" cy="-41" rx="7" ry="3" fill="#6E4A2A" />
    </g>
  );
}

/* ─────────────────────────── Momo (film-posable art) ─────────────────────────── */
export type { MomoPose } from "../momo/types";

/** Same figure as the interactive MomoMascot, posed by props for deterministic frames. */
export function MomoArt({ prefix = "cast", pose = {}, scale = 1 }: { prefix?: string; pose?: MomoPose; scale?: number }) {
  return (
    <g transform={`scale(${scale}) translate(-100 -232)`}>
      <MomoFigure prefix={`${prefix}-momo`} pose={pose} />
    </g>
  );
}

/* ─────────────────────────── Cake, table, knife ─────────────────────────── */
export function Flame({ x, y, size = 1, flicker = 0 }: { x: number; y: number; size?: number; flicker?: number }) {
  const s = size * (1 + Math.sin(flicker * 9) * 0.07);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(flicker * 7) * 4})`}>
      <ellipse cx="0" cy="-6" rx="14" ry="18" fill="#FFD75E" opacity="0.18" />
      <path d="M0 -24 C7 -16 9 -8 6 -2 C4 2 -4 2 -6 -2 C-9 -8 -7 -16 0 -24Z" fill="url(#cast-flame)" />
      <ellipse cx="0" cy="-5" rx="2.4" ry="5" fill="#FFF9D6" opacity="0.9" />
    </g>
  );
}

export function Candle({ x, y, lit, flicker = 0, color = PALETTE.lavender }: { x: number; y: number; lit: boolean; flicker?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-5" y="-30" width="10" height="32" rx="3" fill={color} />
      <path d="M-5 -24 L5 -24 M-5 -16 L5 -16 M-5 -8 L5 -8" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" />
      <rect x="-1" y="-36" width="2" height="7" fill="#5E3A2A" />
      {lit && <Flame x={0} y={-34} size={0.8} flicker={flicker} />}
    </g>
  );
}

export interface CakeProps {
  prefix?: string;
  /** 0 = intact; 1 = slice fully separated. */
  cut?: number;
  candlesLit?: boolean[];
  flicker?: number;
  sparkle?: number; // 0..1 candle sparkles intensity
}

export function Cake({ prefix = "cast", cut = 0, candlesLit = [true, true, true], flicker = 0, sparkle = 0 }: CakeProps) {
  const sliceDx = cut * 46;
  const sliceDy = cut * 8;
  return (
    <g>
      {/* stand */}
      <ellipse cx="0" cy="0" rx="96" ry="12" fill="#E7DCF9" />
      <ellipse cx="0" cy="-3" rx="96" ry="12" fill="#F4EEFF" />
      {/* bottom tier */}
      <rect x="-72" y="-66" width="144" height="66" rx="10" fill={`url(#${prefix}-cake-bottom)`} />
      <path d="M-72 -62 Q-60 -48 -50 -62 Q-40 -44 -30 -62 Q-18 -46 -6 -62 Q6 -44 18 -62 Q30 -48 42 -62 Q54 -44 66 -62 L72 -62 L72 -70 Q0 -78 -72 -70Z" fill="#FFF5DF" />
      <ellipse cx="0" cy="-66" rx="72" ry="10" fill="#FFF9EC" />
      {/* top tier */}
      <rect x="-48" y="-116" width="96" height="52" rx="9" fill={`url(#${prefix}-cake-top)`} />
      <path d="M-48 -112 Q-38 -98 -28 -112 Q-18 -96 -8 -112 Q2 -98 12 -112 Q22 -96 32 -112 Q40 -100 48 -112 L48 -120 Q0 -128 -48 -120Z" fill="#FFF5DF" />
      <ellipse cx="0" cy="-116" rx="48" ry="8" fill="#FFF9EC" />
      {/* strawberries on top */}
      {[[-26, -120], [0, -124], [26, -120]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M-7 -4 C-7 -12 7 -12 7 -4 C7 4 0 10 0 10 C0 10 -7 4 -7 -4Z" fill="#E2495F" />
          <path d="M-5 -10 L0 -14 L5 -10 L2 -8 L-2 -8Z" fill={PALETTE.mint} />
          <circle cx="-2" cy="-2" r="0.9" fill="#FFF0A8" />
          <circle cx="2.5" cy="1" r="0.9" fill="#FFF0A8" />
          <circle cx="-1" cy="4" r="0.9" fill="#FFF0A8" />
        </g>
      ))}
      {/* candles */}
      <Candle x={-24} y={-124} lit={!!candlesLit[0]} flicker={flicker} color={PALETTE.lavender} />
      <Candle x={0} y={-128} lit={!!candlesLit[1]} flicker={flicker + 1} color={PALETTE.pink} />
      <Candle x={24} y={-124} lit={!!candlesLit[2]} flicker={flicker + 2} color={PALETTE.mint} />
      {sparkle > 0 &&
        Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2 + flicker * 0.8;
          const r = 30 + ((i * 13) % 20) + Math.sin(flicker * 3 + i) * 6;
          return <circle key={i} cx={Math.cos(a) * r} cy={-150 + Math.sin(a) * r * 0.5} r={1.6 + (i % 3) * 0.6} fill="#FFF5DF" opacity={sparkle * (0.4 + 0.6 * Math.abs(Math.sin(flicker * 5 + i)))} />;
        })}
      {/* strawberry on the bottom tier (left) */}
      <g transform="translate(-52 -72)">
        <path d="M-7 -4 C-7 -12 7 -12 7 -4 C7 4 0 10 0 10 C0 10 -7 4 -7 -4Z" fill="#E2495F" />
        <path d="M-5 -10 L0 -14 L5 -10 L2 -8 L-2 -8Z" fill={PALETTE.mint} />
        <circle cx="-2" cy="-2" r="0.9" fill="#FFF0A8" />
        <circle cx="2.5" cy="1" r="0.9" fill="#FFF0A8" />
      </g>
      {/* the slice: front-right wedge of the bottom tier, clear of the top tier so the knife reads */}
      {cut > 0 && (
        <>
          {/* exposed layers where the slice used to be */}
          <path d="M46 -66 L46 0 L72 0 L72 -66 Z" fill="#FFE9C9" />
          <path d="M46 -46 L72 -46 M46 -24 L72 -24" stroke="#F5B7D2" strokeWidth="6" />
          <path d="M46 -66 L46 0" stroke="#E7A9C6" strokeWidth="2" />
        </>
      )}
      <g transform={`translate(${sliceDx} ${sliceDy}) rotate(${cut * -6} 60 -10)`}>
        {cut > 0 && (
          <>
            <path d="M46 -66 L46 0 L72 0 L72 -66 Z" fill={`url(#${prefix}-cake-bottom)`} />
            <path d="M46 -46 L72 -46 M46 -24 L72 -24" stroke="#FFE9C9" strokeWidth="6" />
            <path d="M46 -70 Q59 -74 72 -70 L72 -62 L46 -62 Z" fill="#FFF5DF" />
            <path d="M46 -66 L46 0" stroke="#E7A9C6" strokeWidth="1.5" />
          </>
        )}
        {/* strawberry that rides along with the slice — Momo's target */}
        <g transform="translate(59 -72)">
          <path d="M-7 -4 C-7 -12 7 -12 7 -4 C7 4 0 10 0 10 C0 10 -7 4 -7 -4Z" fill="#E2495F" />
          <path d="M-5 -10 L0 -14 L5 -10 L2 -8 L-2 -8Z" fill={PALETTE.mint} />
          <circle cx="-2" cy="-2" r="0.9" fill="#FFF0A8" />
          <circle cx="2.5" cy="1" r="0.9" fill="#FFF0A8" />
        </g>
      </g>
    </g>
  );
}

export function Table({ width = 260 }: { width?: number }) {
  const w = width / 2;
  return (
    <g>
      <ellipse cx="0" cy="36" rx={w * 0.9} ry="14" fill="#0E0D22" opacity="0.18" />
      <path d={`M${-w} 0 L${-w + 10} 30 L${w - 10} 30 L${w} 0 Z`} fill="#F3E9FF" />
      <ellipse cx="0" cy="0" rx={w} ry="22" fill="#FBF6FF" />
      <ellipse cx="0" cy="-2" rx={w - 10} ry="16" fill="#E9DDFB" />
      <path d={`M${-w + 20} 8 Q${-w + 40} 36 ${-w + 60} 8`} fill="none" stroke={PALETTE.pink} strokeWidth="4" strokeLinecap="round" />
      <path d={`M${w - 60} 8 Q${w - 40} 36 ${w - 20} 8`} fill="none" stroke={PALETTE.pink} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

/* ─────────────────────────── Scenery ─────────────────────────── */
export function Tree({ prefix = "cast", canopy = "pink", scale = 1, sway = 0 }: { prefix?: string; canopy?: "pink" | "mint" | "lav"; scale?: number; sway?: number }) {
  return (
    <g transform={`scale(${scale}) rotate(${sway} 0 0)`}>
      <ellipse cx="0" cy="4" rx="60" ry="10" fill="#0E0D22" opacity="0.14" />
      <path d="M-14 0 L-10 -120 L10 -120 L14 0 Z" fill={`url(#${prefix}-trunk)`} />
      <circle cx="-50" cy="-150" r="50" fill={`url(#${prefix}-canopy-${canopy})`} />
      <circle cx="52" cy="-156" r="54" fill={`url(#${prefix}-canopy-${canopy})`} />
      <circle cx="0" cy="-200" r="62" fill={`url(#${prefix}-canopy-${canopy})`} />
      <circle cx="0" cy="-130" r="46" fill={`url(#${prefix}-canopy-${canopy})`} />
      {[[-30, -170], [40, -200], [10, -120], [-60, -130], [60, -140]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#fff" opacity="0.5" />
      ))}
    </g>
  );
}

export function Cloud({ scale = 1, opacity = 0.9 }: { scale?: number; opacity?: number }) {
  return (
    <g transform={`scale(${scale})`} opacity={opacity}>
      <ellipse cx="0" cy="0" rx="80" ry="34" fill="#fff" />
      <circle cx="-40" cy="-14" r="34" fill="#fff" />
      <circle cx="10" cy="-26" r="42" fill="#fff" />
      <circle cx="54" cy="-10" r="30" fill="#fff" />
      <ellipse cx="0" cy="10" rx="80" ry="24" fill="#EFE8FF" />
    </g>
  );
}

export function StringLights({ x1, y1, x2, y2, count = 9, sag = 60, phase = 0 }: { x1: number; y1: number; x2: number; y2: number; count?: number; sag?: number; phase?: number }) {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + sag;
  const pts = Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
    const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
    return { x, y, i };
  });
  const colors = [PALETTE.pineapple, PALETTE.pink, PALETTE.mint, PALETTE.lavender];
  return (
    <g>
      <path d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`} stroke="#5C4A7A" strokeWidth="2" fill="none" />
      {pts.map((p) => {
        const c = colors[(p.i + phase) % colors.length];
        return (
          <g key={p.i} transform={`translate(${p.x} ${p.y})`}>
            <rect x="-3" y="0" width="6" height="6" fill="#5C4A7A" />
            <circle cx="0" cy="14" r="12" fill={c} opacity="0.22" />
            <ellipse cx="0" cy="12" rx="6" ry="8" fill={c} />
            <ellipse cx="-2" cy="9" rx="1.6" ry="2.6" fill="#fff" opacity="0.7" />
          </g>
        );
      })}
    </g>
  );
}

export function Balloon({ prefix = "cast", color, scale = 1, swing = 0, children }: { prefix?: string; color?: string; scale?: number; swing?: number; children?: ReactNode }) {
  return (
    <g transform={`scale(${scale}) rotate(${swing} 0 120)`}>
      <path d="M0 118 Q-6 90 0 60 Q6 30 0 0" stroke="#7A6C9B" strokeWidth="2" fill="none" />
      {/* banana-balloon: a plump crescent */}
      <path d="M-26 -10 C-46 -40 -20 -90 10 -84 C44 -78 46 -30 24 -4 C12 10 -14 10 -26 -10Z" fill={color ?? `url(#${prefix}-balloon)`} />
      <path d="M-16 -60 C-10 -76 6 -80 14 -72" stroke="#fff" strokeOpacity="0.7" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M-4 -4 L4 -4 L0 6Z" fill={color ?? "#F2B443"} />
      {children}
    </g>
  );
}

export function GiftBox({ prefix = "cast", open = 0, golden = false }: { prefix?: string; open?: number; golden?: boolean }) {
  const lidDy = -open * 70;
  const lidRot = open * -28;
  const body = golden ? "url(#cast-hat)" : `url(#${prefix}-gift)`;
  const ribbon = golden ? PALETTE.pink : PALETTE.pineapple;
  return (
    <g>
      <ellipse cx="0" cy="4" rx="54" ry="9" fill="#0E0D22" opacity="0.18" />
      <rect x="-44" y="-70" width="88" height="70" rx="8" fill={body} />
      <rect x="-8" y="-70" width="16" height="70" fill={ribbon} />
      <g transform={`translate(0 ${lidDy}) rotate(${lidRot} 44 -70)`}>
        <rect x="-50" y="-92" width="100" height="26" rx="7" fill={body} />
        <rect x="-8" y="-92" width="16" height="26" fill={ribbon} />
        <path d="M0 -92 C-22 -118 -40 -104 -16 -92 M0 -92 C22 -118 40 -104 16 -92" fill={ribbon} stroke={ribbon} strokeWidth="6" strokeLinejoin="round" />
        <circle cx="0" cy="-92" r="7" fill={ribbon} />
      </g>
    </g>
  );
}

export function PineappleHouse({ prefix = "cast" }: { prefix?: string }) {
  return (
    <g>
      <ellipse cx="0" cy="6" rx="110" ry="16" fill="#0E0D22" opacity="0.16" />
      {/* leaves roof */}
      {[-60, -34, -10, 14, 40].map((a, i) => (
        <path key={i} d="M0 -230 C-20 -300 -4 -350 10 -372 C30 -340 24 -290 0 -230Z" fill={`url(#${prefix}-leaf)`} transform={`rotate(${a} 0 -230)`} opacity={0.85 + (i % 2) * 0.15} />
      ))}
      <path d="M-90 -80 C-90 -200 -40 -250 0 -250 C40 -250 90 -200 90 -80 C90 -20 60 0 0 0 C-60 0 -90 -20 -90 -80Z" fill={`url(#${prefix}-hat)`} />
      <path d="M-90 -80 C-90 -200 -40 -250 0 -250 C40 -250 90 -200 90 -80 C90 -20 60 0 0 0 C-60 0 -90 -20 -90 -80Z" fill={`url(#${prefix}-hatch)`} />
      {/* door + window */}
      <path d="M-24 0 L-24 -60 Q0 -86 24 -60 L24 0Z" fill="#8E5A3C" />
      <path d="M-18 0 L-18 -58 Q0 -78 18 -58 L18 0Z" fill="#B57A52" />
      <circle cx="12" cy="-28" r="3" fill={PALETTE.pineapple} />
      <circle cx="0" cy="-150" r="24" fill="#5C4A7A" />
      <circle cx="0" cy="-150" r="19" fill="#FFF2C2" />
      <path d="M-19 -150 H19 M0 -169 V-131" stroke="#5C4A7A" strokeWidth="3" />
      <circle cx="0" cy="-150" r="26" fill="#FFF2C2" opacity="0.25" />
    </g>
  );
}

export function PineappleBush({ prefix = "cast", golden = 0 }: { prefix?: string; golden?: number }) {
  return (
    <g>
      <ellipse cx="0" cy="4" rx="70" ry="10" fill="#0E0D22" opacity="0.16" />
      <circle cx="-34" cy="-30" r="34" fill={`url(#${prefix}-canopy-mint)`} />
      <circle cx="34" cy="-30" r="34" fill={`url(#${prefix}-canopy-mint)`} />
      <circle cx="0" cy="-44" r="40" fill={`url(#${prefix}-canopy-mint)`} />
      {[[-40, -40], [10, -70], [40, -20], [-10, -20]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#FFF5DF" opacity="0.6" />
      ))}
      {golden > 0 && (
        <g transform={`translate(0 ${-60 - golden * 70}) scale(${0.3 + golden * 0.7})`} opacity={Math.min(1, golden * 1.4)}>
          <circle cx="0" cy="-26" r="60" fill="#FFD75E" opacity={0.22 * golden} />
          {[-40, -15, 10, 36].map((a, i) => (
            <path key={i} d="M0 -46 C-10 -70 -4 -92 4 -104 C16 -88 12 -66 0 -46Z" fill={`url(#${prefix}-leaf)`} transform={`rotate(${a} 0 -46)`} />
          ))}
          <ellipse cx="0" cy="-16" rx="28" ry="36" fill={`url(#${prefix}-hat)`} />
          <ellipse cx="0" cy="-16" rx="28" ry="36" fill={`url(#${prefix}-hatch)`} />
          <ellipse cx="-10" cy="-32" rx="6" ry="10" fill="#fff" opacity="0.45" />
        </g>
      )}
    </g>
  );
}
