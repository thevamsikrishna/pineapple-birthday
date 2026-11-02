/**
 * MOMO THE MONKEY — the single source of truth for his look.
 * One shaded, dimensional vector figure (viewBox 0 0 200 240, feet at y≈232) used by:
 *   • MomoMascot (interactive, CSS clips attached to the named groups), and
 *   • the film's MomoArt (time-driven poses, no CSS).
 * Keep the anchor points stable: arms pivot at (68,150)/(132,150), tail at (150,190),
 * hat at (100,62), head group at (100,120).
 */
import type { MomoPose } from "./types";

export type { MomoPose };

/** Gradient + filter definitions. Render inside a <defs> element. */
export function MomoGradients({ prefix }: { prefix: string }) {
  return (
    <>
      <radialGradient id={`${prefix}-fur`} cx="36%" cy="26%" r="80%">
        <stop offset="0%" stopColor="#DDA86F" />
        <stop offset="45%" stopColor="#B9763C" />
        <stop offset="100%" stopColor="#6F3F1C" />
      </radialGradient>
      <radialGradient id={`${prefix}-furdark`} cx="40%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#B06F38" />
        <stop offset="100%" stopColor="#5E3417" />
      </radialGradient>
      <radialGradient id={`${prefix}-rim`} cx="50%" cy="42%" r="58%">
        <stop offset="62%" stopColor="#3A1E0A" stopOpacity="0" />
        <stop offset="100%" stopColor="#3A1E0A" stopOpacity="0.42" />
      </radialGradient>
      <radialGradient id={`${prefix}-sheen`} cx="35%" cy="22%" r="45%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${prefix}-cream`} cx="40%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#FFF8EA" />
        <stop offset="70%" stopColor="#F1D8B8" />
        <stop offset="100%" stopColor="#D8B58C" />
      </radialGradient>
      <linearGradient id={`${prefix}-face`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBEBD8" />
        <stop offset="100%" stopColor="#E8C4A2" />
      </linearGradient>
      <radialGradient id={`${prefix}-ear`} cx="45%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#F2C3A6" />
        <stop offset="100%" stopColor="#C98A69" />
      </radialGradient>
      <radialGradient id={`${prefix}-iris`} cx="38%" cy="32%" r="70%">
        <stop offset="0%" stopColor="#9C6A3E" />
        <stop offset="55%" stopColor="#5C3A1E" />
        <stop offset="100%" stopColor="#2A170B" />
      </radialGradient>
      <linearGradient id={`${prefix}-hat`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFE9A3" />
        <stop offset="55%" stopColor="#F6C553" />
        <stop offset="100%" stopColor="#D99A2C" />
      </linearGradient>
      <linearGradient id={`${prefix}-leaf`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#4FA87A" />
        <stop offset="100%" stopColor="#A6E3C3" />
      </linearGradient>
      <pattern id={`${prefix}-hatch`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0H9" stroke="#C98A20" strokeWidth="1.1" opacity="0.6" />
        <path d="M0 0V9" stroke="#C98A20" strokeWidth="1.1" opacity="0.6" />
      </pattern>
      <filter id={`${prefix}-soft`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </>
  );
}

export interface MomoFigureProps {
  prefix: string;
  /** Adds the class names the CSS clips target (interactive mascot). Off for the film. */
  animated?: boolean;
  pose?: MomoPose;
  emotion?: "happy" | "surprised" | "cheeky";
  hatToken?: boolean;
  shadow?: boolean;
}

const Hand = ({ x, y, prefix }: { x: number; y: number; prefix: string }) => (
  <g>
    <ellipse cx={x} cy={y} rx="10.5" ry="9" fill={`url(#${prefix}-cream)`} />
    {[-7, -2.5, 2.5, 7].map((dx, i) => (
      <ellipse key={i} cx={x + dx} cy={y + 7 - Math.abs(dx) * 0.25} rx="2.6" ry="4" fill={`url(#${prefix}-cream)`} />
    ))}
    <ellipse cx={x - 2} cy={y - 2} rx="5" ry="3.5" fill="#fff" opacity="0.25" />
  </g>
);

const Foot = ({ x, y, prefix, flip = 1 }: { x: number; y: number; prefix: string; flip?: 1 | -1 }) => (
  <g>
    <ellipse cx={x} cy={y} rx="14" ry="8" fill={`url(#${prefix}-cream)`} />
    {[-9, -4, 1, 6].map((dx, i) => (
      <circle key={i} cx={x + dx * flip} cy={y + 4 - Math.abs(dx + 1) * 0.2} r={3 - i * 0.3} fill={`url(#${prefix}-cream)`} />
    ))}
    <ellipse cx={x} cy={y - 2} rx="7" ry="2.5" fill="#fff" opacity="0.22" />
  </g>
);

export function MomoFigure({ prefix, animated = false, pose = {}, emotion = "happy", hatToken = false, shadow = true }: MomoFigureProps) {
  const { armL = 0, armR = 0, mouthO = false, hatDx = 0, hatDy = 0, hatRot = 0, bodyRot = 0, eyeScale = 1, eyesClosed = false } = pose;
  const surprised = emotion === "surprised" || mouthO;
  const eyeK = surprised ? Math.max(eyeScale, 1.15) : eyeScale;
  const c = (name: string) => (animated ? name : undefined);
  const u = (g: string) => `url(#${prefix}-${g})`;

  return (
    <g transform={bodyRot ? `rotate(${bodyRot} 100 170)` : undefined}>
      {shadow && <ellipse cx="100" cy="231" rx="46" ry="7" fill="#0E0D22" opacity="0.28" filter={`url(#${prefix}-soft)`} />}

      {/* tail: dark core + lighter top edge reads as a round furry tube */}
      <g className={c("momo-tail")}>
        <path d="M146 188 C188 184 198 146 170 132 C156 126 148 140 158 148" fill="none" stroke="#6F3F1C" strokeWidth="13" strokeLinecap="round" />
        <path d="M147 186 C186 182 194 148 169 135 C157 129 150 141 159 147" fill="none" stroke="#B9763C" strokeWidth="7" strokeLinecap="round" />
        <path d="M150 183 C182 180 189 152 168 139" fill="none" stroke="#DDA86F" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      </g>

      <g className={c("momo-body-group")}>
        {/* thighs + feet */}
        <ellipse cx="76" cy="214" rx="21" ry="15" fill={u("furdark")} />
        <ellipse cx="124" cy="214" rx="21" ry="15" fill={u("furdark")} />
        <ellipse cx="78" cy="208" rx="14" ry="8" fill={u("fur")} opacity="0.9" />
        <ellipse cx="122" cy="208" rx="14" ry="8" fill={u("fur")} opacity="0.9" />
        <Foot x={68} y={223} prefix={prefix} />
        <Foot x={132} y={223} prefix={prefix} flip={-1} />
        {/* torso */}
        <ellipse cx="100" cy="172" rx="45" ry="51" fill={u("fur")} />
        <ellipse cx="100" cy="172" rx="45" ry="51" fill={u("rim")} />
        <ellipse cx="100" cy="172" rx="45" ry="51" fill={u("sheen")} />
        {/* fur edge tufts */}
        <path d="M57 150 l-3.5 -2 M55 165 l-4 -0.5 M56 182 l-4 2 M143 150 l3.5 -2 M145 165 l4 -0.5 M144 182 l4 2" stroke="#8A4F22" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />
        {/* belly */}
        <ellipse cx="100" cy="182" rx="27" ry="34" fill={u("cream")} />
        <ellipse cx="96" cy="170" rx="14" ry="16" fill="#fff" opacity="0.28" />
        {/* arms */}
        <g className={c("momo-arm-l")} transform={!animated && armL ? `rotate(${armL} 68 150)` : undefined}>
          <path d="M68 150 C50 165 44 180 50 196" fill="none" stroke="#7F4B22" strokeWidth="16" strokeLinecap="round" />
          <path d="M68 150 C50 165 44 180 50 196" fill="none" stroke="#B9763C" strokeWidth="10" strokeLinecap="round" />
          <path d="M66 152 C52 165 48 176 51 190" fill="none" stroke="#DDA86F" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
          <Hand x={50} y={199} prefix={prefix} />
        </g>
        <g className={c("momo-arm-r")} transform={!animated && armR ? `rotate(${armR} 132 150)` : undefined}>
          <path d="M132 150 C150 165 156 180 150 196" fill="none" stroke="#7F4B22" strokeWidth="16" strokeLinecap="round" />
          <path d="M132 150 C150 165 156 180 150 196" fill="none" stroke="#B9763C" strokeWidth="10" strokeLinecap="round" />
          <path d="M134 152 C148 165 152 176 149 190" fill="none" stroke="#DDA86F" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
          <Hand x={150} y={199} prefix={prefix} />
        </g>
      </g>

      <g className={c("momo-head-group")}>
        {/* ears */}
        <circle cx="48" cy="102" r="20" fill={u("furdark")} />
        <circle cx="152" cy="102" r="20" fill={u("furdark")} />
        <circle cx="50" cy="103" r="12" fill={u("ear")} />
        <circle cx="150" cy="103" r="12" fill={u("ear")} />
        <path d="M44 98 C42 106 46 112 52 112" fill="none" stroke="#B7795A" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M156 98 C158 106 154 112 148 112" fill="none" stroke="#B7795A" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        {/* head */}
        <circle cx="100" cy="106" r="53" fill={u("fur")} />
        <circle cx="100" cy="106" r="53" fill={u("rim")} />
        <circle cx="100" cy="106" r="53" fill={u("sheen")} />
        {/* cheek + crown fur tufts */}
        <path d="M50 118 l-4 0.5 M52 128 l-5 2.5 M57 138 l-4.5 4 M150 118 l4 0.5 M148 128 l5 2.5 M143 138 l4.5 4" stroke="#8A4F22" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />
        <path d="M86 56 C84 46 92 42 96 50 M98 55 C96 44 106 40 110 48 M112 58 C114 48 122 48 122 56" fill="none" stroke="#8A4F22" strokeWidth="4" strokeLinecap="round" />
        {/* face mask (heart-shaped, lighter) */}
        <path d="M58 104 C58 74 78 64 100 72 C122 64 142 74 142 104 C142 132 124 150 100 150 C76 150 58 132 58 104Z" fill={u("face")} />
        <path d="M68 96 C76 80 96 80 100 90 C104 80 124 80 132 96" fill="none" stroke="#C99670" strokeWidth="2" opacity="0.35" />
        {/* brow ridge */}
        <path d="M70 92 Q84 85 97 93" fill="none" stroke="#B07E58" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
        <path d="M103 93 Q116 85 130 92" fill="none" stroke="#B07E58" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
        {/* cheeks */}
        <circle cx="70" cy="121" r="8" fill="#F19AB9" opacity="0.32" />
        <circle cx="130" cy="121" r="8" fill="#F19AB9" opacity="0.32" />
        {/* eyes */}
        {[84, 116].map((ex) => (
          <g key={ex} transform={`translate(${ex} 103) scale(${eyeK}) translate(${-ex} -103)`}>
            <ellipse cx={ex} cy="103" rx="9.5" ry="10.2" fill="#F7F1E6" />
            {eyesClosed ? (
              <path d={`M${ex - 8} 103 Q${ex} 111 ${ex + 8} 103`} fill="none" stroke="#3B2314" strokeWidth="2.4" strokeLinecap="round" />
            ) : (
              <>
                <circle cx={ex + 0.5} cy="104" r="7.4" fill={u("iris")} />
                <circle cx={ex + 0.8} cy="104.5" r="3.9" fill="#120A05" />
                <circle cx={ex + 3.6} cy="100.4" r="2.7" fill="#fff" />
                <circle cx={ex - 2.6} cy="107.2" r="1.3" fill="#fff" opacity="0.85" />
              </>
            )}
            <path d={`M${ex - 9.5} 101 Q${ex} 91 ${ex + 9.5} 101`} fill="none" stroke="#5C3A1E" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
          </g>
        ))}
        {/* eyelids (blink) */}
        {animated && (
          <>
            <rect className="momo-eyelid" x="73" y="92" width="22" height="22" rx="9" fill={u("face")} />
            <rect className="momo-eyelid delay" x="105" y="92" width="22" height="22" rx="9" fill={u("face")} />
          </>
        )}
        {emotion === "cheeky" && <rect x="105" y="92" width="22" height="11" rx="6" fill={u("face")} />}
        {/* muzzle, nose, mouth */}
        <ellipse cx="100" cy="125" rx="17" ry="12" fill="#E6BE9C" opacity="0.55" />
        <ellipse cx="100" cy="117" rx="7.5" ry="4.8" fill="#D6A585" />
        <ellipse cx="96.6" cy="117.8" rx="1.9" ry="1.3" fill="#5C3A1E" />
        <ellipse cx="103.4" cy="117.8" rx="1.9" ry="1.3" fill="#5C3A1E" />
        <path d="M100 121 L100 126" stroke="#C99670" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        {surprised ? (
          <g>
            <ellipse cx="100" cy="132" rx="5.5" ry="7.5" fill="#3B1E14" />
            <ellipse cx="100" cy="136" rx="3" ry="2.6" fill="#E27A8F" />
          </g>
        ) : (
          <>
            <path d="M89 128 Q100 138 111 128" fill="none" stroke="#5C3A1E" strokeWidth="2.3" strokeLinecap="round" />
            <path d="M92 131 Q100 138 108 131" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
          </>
        )}
        {animated && <ellipse className="momo-mouth-o" cx="100" cy="131" rx="5" ry="7" fill="#3B1E14" />}
        {/* pineapple party hat */}
        <g className={c("momo-hat")} transform={!animated && (hatDx || hatDy || hatRot) ? `translate(${hatDx} ${hatDy}) rotate(${hatRot} 100 62)` : undefined}>
          <g transform="rotate(-14 100 62)">
            <ellipse cx="100" cy="80" rx="23" ry="5" fill="#000" opacity="0.18" filter={`url(#${prefix}-soft)`} />
            <path d="M100 14 C88 24 86 36 95 46 C104 36 108 24 100 14Z" fill={u("leaf")} />
            <path d="M100 16 C112 24 114 36 104 46 C96 36 92 24 100 16Z" fill="#8FD2AF" opacity="0.9" />
            <path d="M94 22 C90 30 92 38 97 44" stroke="#3E8B61" strokeWidth="1.2" fill="none" opacity="0.6" />
            <path d="M78 78 L100 30 L122 78 Z" fill={u("hat")} />
            <path d="M78 78 L100 30 L122 78 Z" fill={u("hatch")} />
            <path d="M100 30 L84 70" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
            <path d="M76 78 Q100 70 124 78 Q100 86 76 78Z" fill="#F19AB9" />
            <path d="M80 79 Q100 73 120 79" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.5" />
            {hatToken && (
              <g className={c("anim-pop-in")}>
                <circle cx="100" cy="52" r="9" fill="#FFD75E" stroke="#D99A2C" strokeWidth="1.5" />
                <path d="M100 46 L101.8 50.2 L106 50.5 L102.8 53.3 L103.8 57.5 L100 55.2 L96.2 57.5 L97.2 53.3 L94 50.5 L98.2 50.2 Z" fill="#fff" opacity="0.9" />
              </g>
            )}
          </g>
        </g>
      </g>
    </g>
  );
}
