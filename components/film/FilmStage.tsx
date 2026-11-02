/**
 * THE BIRTHDAY FILM — a deterministic, time-driven animated storybook.
 * Given a time `t` (seconds, 0–28) it renders the exact frame, which lets the same component
 * play live in the browser (Scene 2 fallback) AND be captured frame-by-frame into a real MP4
 * by scripts/render-film.mjs. Seven shots follow the storyboard in docs/storyboard.md.
 */
import { Balloon, Bird, Bunny, Cake, Cloud, Deer, Defs, Girl, Kitten, MomoArt, PALETTE, Squirrel, StringLights, Table, Tree } from "./Cast";

export const FILM_DURATION = 28;
export const FILM_WIDTH = 1600;
export const FILM_HEIGHT = 900;

export interface Shot {
  start: number;
  end: number;
  title: string;
  caption: string;
}

export const SHOTS: Shot[] = [
  { start: 0, end: 4, title: "The garden wakes", caption: "Once upon a golden evening, the garden guests gathered…" },
  { start: 4, end: 8, title: "The birthday girl", caption: "The birthday girl arrives, and the bunny brings a flower." },
  { start: 8, end: 12, title: "Momo’s big idea", caption: "Momo spots a strawberry. The bunny spots Momo." },
  { start: 12, end: 17, title: "Three candles", caption: "Three little candles. One big wish." },
  { start: 17, end: 21, title: "The first slice", caption: "And… the first slice!" },
  { start: 21, end: 25, title: "Hip hip hooray", caption: "Hip hip hooray! Confetti for everyone." },
  { start: 25, end: 28, title: "Momo, wait!", caption: "Momo, wait, where are you going?" },
];

export function shotAt(t: number): Shot {
  return SHOTS.find((s) => t >= s.start && t < s.end) ?? SHOTS[SHOTS.length - 1];
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (p: number) => p * p * (3 - 2 * p);
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
/** Progress 0→1 of t within [a, b]. */
const seg = (t: number, a: number, b: number, ease: (p: number) => number = smooth) => ease(clamp((t - a) / (b - a)));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** Rounds to 4 decimals so server and client never disagree in the last floating-point digit. */
const r4 = (v: number) => Math.round(v * 10000) / 10000;
/** Deterministic pseudo-random in [0,1) for frame-stable confetti and sparkles. */
const prand = (i: number, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

interface Camera {
  cx: number;
  cy: number;
  s: number;
}

export function cameraAt(t: number): Camera {
  if (t < 4) return { cx: 800, cy: lerp(430, 520, seg(t, 0, 4)), s: lerp(0.84, 1.0, seg(t, 0, 4)) };
  if (t < 8) return { cx: lerp(740, 760, seg(t, 4, 8)), cy: 545, s: lerp(1.45, 1.58, seg(t, 4, 8)) };
  if (t < 12) return { cx: lerp(880, 860, seg(t, 8, 12)), cy: 585, s: lerp(1.85, 1.95, seg(t, 8, 12)) };
  if (t < 17) return { cx: 805, cy: lerp(540, 548, seg(t, 12, 17)), s: lerp(2.1, 2.3, seg(t, 12, 17)) };
  if (t < 21) return { cx: 812, cy: 552, s: lerp(2.3, 2.45, seg(t, 17, 21)) };
  if (t < 25) return { cx: 800, cy: lerp(520, 500, seg(t, 21, 25)), s: lerp(1.02, 1.12, seg(t, 21, 25)) };
  return { cx: 800, cy: 470, s: 1.0 };
}

export interface FilmStageProps {
  t: number;
  /** "landscape" shows the full 16:9 frame; "portrait" crops to the centre for phones. */
  aspect?: "landscape" | "portrait";
  className?: string;
  showCaption?: boolean;
}

export function FilmStage({ t, aspect = "landscape", className = "", showCaption = true }: FilmStageProps) {
  const time = clamp(t, 0, FILM_DURATION);
  const cam = cameraAt(time);
  const shot = shotAt(time);

  /* ─── Shot 1: guests gather ─── */
  const deerX = lerp(220, 430, seg(time, 0.6, 3.4));
  const deerBob = Math.sin(time * 10) * (time < 3.4 ? 3 : 0.6);
  const kittenX = lerp(1250, 1070, seg(time, 0.8, 3.6));
  const kittenWag = Math.sin(time * 3) * 10;
  const bunnyHopPhase = time < 3.8 ? Math.abs(Math.sin(time * 6)) * 22 : 0;
  const bunnyX = time < 8 ? lerp(520, 600, seg(time, 0.4, 3.8)) : lerp(600, 690, seg(time, 8, 9.2));
  const bunnyY = time < 8 ? 705 : lerp(705, 718, seg(time, 8, 9.2));
  const birdOrbit = (i: number) => {
    if (time >= 21 && time < 25.5) {
      const a = time * 2.4 + i * Math.PI;
      return { x: 800 + Math.cos(a) * 230, y: 300 + Math.sin(a) * 70 - i * 30, flap: Math.abs(Math.sin(time * 14 + i)), facing: (Math.cos(a) < 0 ? 1 : -1) as 1 | -1 };
    }
    const base = i === 0 ? { x: lerp(-100, 1000, seg(time, 0, 6, (p) => p)), y: 250 + Math.sin(time * 3) * 20 } : { x: lerp(1750, 560, seg(time, 1, 7, (p) => p)), y: 200 + Math.sin(time * 2.6 + 1) * 24 };
    if (time >= 7) base.x = i === 0 ? 1180 + Math.sin(time) * 8 : 420 + Math.sin(time * 0.8) * 8;
    if (time >= 7) base.y = i === 0 ? 352 : 330;
    return { ...base, flap: time >= 7 ? Math.abs(Math.sin(time * 4 + i)) * 0.3 : Math.abs(Math.sin(time * 14 + i)), facing: (i === 0 ? 1 : -1) as 1 | -1 };
  };

  /* ─── Shot 2: girl steps in ─── */
  const girlWalk = seg(time, 1.2, 5.2, (p) => p);
  const girlX = lerp(380, 752, girlWalk);
  const girlBob = girlWalk < 1 ? Math.abs(Math.sin(time * 9)) * -5 : Math.sin(time * 1.6) * 1.5;
  const girlExpression: "smile" | "joy" | "focus" =
    time >= 21 ? "joy" : time >= 5.4 && time < 7.6 ? "joy" : time >= 12.4 && time < 20.6 ? "focus" : "smile";
  // Shot 4-5: she takes the knife and cuts the cake.
  const holdingKnife = time >= 12.5;
  let armAngle = time < 12.5 ? -8 + Math.sin(time * 1.5) * 3 : lerp(-8, -120, seg(time, 12.5, 14.2, easeOut));
  if (time >= 14.2 && time < 17.6) armAngle = -120 + Math.sin(time * 2) * 2; // poised
  if (time >= 17.6) armAngle = lerp(-120, -40, seg(time, 17.6, 19.0, easeInOut)); // the cut
  if (time >= 19.6) armAngle = lerp(-40, -95, seg(time, 19.6, 20.6, easeOut)); // lifts the knife out
  if (time >= 21) armAngle = -150 + Math.sin(time * 6) * 8; // celebrating arms up
  const leftArmAngle = time >= 21 ? 150 + Math.sin(time * 6 + 1) * 8 : 6 + Math.sin(time * 1.4) * 3;
  const girlLean = time >= 17.6 && time < 20.6 ? lerp(0, 7, seg(time, 17.6, 19)) : 0;
  const cut = seg(time, 19.0, 20.4, easeOut);

  /* ─── Shot 3: Momo tiptoes and reaches for the strawberry ─── */
  const momoTiptoe = seg(time, 8.1, 9.6, (p) => p);
  const momoRetreat = seg(time, 11.6, 12.6, easeInOut); // shuffles back behind the table, embarrassed
  const momoInFront = time < 12.1;
  const momoX = lerp(lerp(1180, 935, momoTiptoe), 985, momoRetreat);
  const momoY = lerp(696, 658, momoRetreat) + (momoTiptoe < 1 && momoTiptoe > 0 ? Math.abs(Math.sin(time * 12)) * -8 : 0);
  const reach = seg(time, 9.6, 10.5, easeOut) * (1 - seg(time, 10.9, 11.3, easeOut));
  const momoFrozen = time >= 10.4 && time < 11.6;
  let momoArmL = reach * 128;
  let momoArmR = reach * -20;
  let momoBodyRot = reach * -14;
  let momoMouthO = momoFrozen;
  let momoEyeScale = momoFrozen ? 1.25 : 1;
  let momoHopY = reach * -34; // up on tiptoes to reach the strawberry
  const bunnyGlare = time >= 10.1 && time < 11.8;
  if (time >= 21 && time < 25) {
    // clapping
    const c = Math.sin(time * 16);
    momoArmL = -45 + c * 25;
    momoArmR = 45 - c * 25;
    momoBodyRot = Math.sin(time * 4) * 4;
    momoHopY = Math.abs(Math.sin(time * 8)) * -14;
    momoMouthO = false;
    momoEyeScale = 1;
  }
  const bunnyCelebrate = time >= 21 && time < 25.5 ? Math.abs(Math.sin(time * 7)) * 36 : 0;
  const squirrelDance = time >= 21 && time < 25.5 ? Math.sin(time * 9) * 14 : Math.sin(time * 1.2) * 2;

  /* ─── Shot 7: balloon flight → pineapple portal ─── */
  const balloonDrop = seg(time, 25, 26, easeInOut);
  const balloonX = lerp(1080, 920, balloonDrop);
  const balloonY = lerp(120, 540, balloonDrop);
  const fly = seg(time, 26.1, 27.6, easeInOut);
  const flyScale = lerp(0.75, 6, fly);
  const flyX = lerp(985, 800, fly);
  const flyY = lerp(652, 1150, fly);
  const portal = seg(time, 27.1, 28, easeInOut);
  const flying = time >= 26.1;
  if (flying) {
    momoArmL = -160;
    momoArmR = 160;
    momoBodyRot = Math.sin(time * 3) * 6;
    momoMouthO = true;
    momoEyeScale = 1.2;
  }

  const flicker = time;
  const sparkle = time >= 12 && time < 17.5 ? seg(time, 12.2, 13.5) : 0;
  const confettiOn = time >= 21 && time < 26;

  const viewBox = aspect === "portrait" ? `${FILM_WIDTH / 2 - 338} 0 676 ${FILM_HEIGHT}` : `0 0 ${FILM_WIDTH} ${FILM_HEIGHT}`;

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={`Birthday film, ${shot.title}: ${shot.caption}`}>
      <Defs prefix="cast" />
      <defs>
        <linearGradient id="film-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8F7BE3" />
          <stop offset="38%" stopColor="#D8B6E8" />
          <stop offset="70%" stopColor="#FFD1B0" />
          <stop offset="100%" stopColor="#F8C86A" />
        </linearGradient>
        <radialGradient id="film-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3C4" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#FFD75E" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFD75E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="film-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A9E2C4" />
          <stop offset="100%" stopColor="#6FBF93" />
        </linearGradient>
        <linearGradient id="film-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CDBDF7" />
          <stop offset="100%" stopColor="#A08BEE" />
        </linearGradient>
        <radialGradient id="film-vignette" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="#16152E" stopOpacity="0" />
          <stop offset="100%" stopColor="#16152E" stopOpacity="0.45" />
        </radialGradient>
        <radialGradient id="film-portal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF4C2" />
          <stop offset="55%" stopColor="#FFD75E" />
          <stop offset="100%" stopColor="#F2B443" />
        </radialGradient>
      </defs>

      {/* Sky is drawn in screen space so the camera never reveals an edge */}
      <rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#film-sky)" />

      <g transform={`translate(800 450) scale(${cam.s}) translate(${-cam.cx} ${-cam.cy})`}>
        {/* sun + far clouds (parallax: move slightly with camera) */}
        <circle cx="1180" cy="250" r="260" fill="url(#film-sun)" />
        <g transform={`translate(${Math.sin(time * 0.2) * 10} 0)`}>
          <g transform="translate(260 200)"><Cloud scale={1.1} opacity={0.85} /></g>
          <g transform="translate(1320 150)"><Cloud scale={0.9} opacity={0.8} /></g>
          <g transform="translate(800 120)"><Cloud scale={0.7} opacity={0.65} /></g>
        </g>
        {/* hills */}
        <path d="M-400 700 Q0 480 420 640 Q800 760 1200 600 Q1600 470 2000 700 L2000 1400 L-400 1400Z" fill="url(#film-hill)" opacity="0.9" />
        <path d="M-400 760 Q200 600 600 700 Q1000 800 1400 680 Q1700 620 2000 760 L2000 1400 L-400 1400Z" fill="#B7A6F3" opacity="0.8" />
        {/* ground */}
        <path d="M-400 640 Q400 600 800 630 Q1200 660 2000 620 L2000 1400 L-400 1400Z" fill="url(#film-ground)" />
        {/* flowers & grass tufts */}
        {Array.from({ length: 34 }, (_, i) => {
          const x = -200 + ((i * 173) % 2000);
          const y = 650 + ((i * 97) % 240);
          const c = [PALETTE.pink, PALETTE.pineapple, PALETTE.lavender, "#fff"][i % 4];
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M0 0 L0 -14" stroke="#4FA87A" strokeWidth="2" />
              <circle cx="0" cy="-16" r="4" fill={c} />
            </g>
          );
        })}
        {/* trees */}
        <g transform="translate(250 650)"><Tree canopy="pink" scale={1.15} sway={Math.sin(time * 0.9) * 1.2} /></g>
        <g transform="translate(1330 640)"><Tree canopy="lav" scale={1.1} sway={Math.sin(time * 0.8 + 1) * 1.2} /></g>
        <g transform="translate(1520 700)"><Tree canopy="mint" scale={0.8} sway={Math.sin(time * 1.1 + 2) * 1.2} /></g>
        <g transform="translate(60 690)"><Tree canopy="mint" scale={0.75} sway={Math.sin(time * 1.0 + 3) * 1.2} /></g>
        {/* string lights */}
        <StringLights x1={300} y1={380} x2={1300} y2={370} count={12} sag={90} phase={Math.floor(time * 2) % 4} />
        <StringLights x1={100} y1={300} x2={700} y2={340} count={7} sag={60} phase={Math.floor(time * 2 + 1) % 4} />
        <StringLights x1={900} y1={330} x2={1500} y2={300} count={7} sag={60} phase={Math.floor(time * 2 + 2) % 4} />
        {/* fireflies */}
        {Array.from({ length: 22 }, (_, i) => {
          const x = 100 + ((i * 211) % 1400) + Math.sin(time * 0.7 + i) * 24;
          const y = 380 + ((i * 131) % 330) + Math.cos(time * 0.5 + i * 2) * 18;
          const o = r4(0.35 + 0.65 * Math.abs(Math.sin(time * 1.3 + i * 1.7)));
          return <circle key={i} cx={r4(x)} cy={r4(y)} r={2.5} fill="#FFF0A8" opacity={o} />;
        })}
        {/* squirrel on the lavender tree */}
        <g transform="translate(1284 468)"><Squirrel facing={-1} dance={squirrelDance} /></g>
        {/* birds */}
        {[0, 1].map((i) => {
          const b = birdOrbit(i);
          return (
            <g key={i} transform={`translate(${b.x} ${b.y})`}>
              <Bird color={i ? PALETTE.pink : PALETTE.mint} flap={b.flap} facing={b.facing} />
            </g>
          );
        })}
        {/* deer */}
        <g transform={`translate(${deerX} 690)`}><Deer bob={deerBob} /></g>
        {/* girl (behind the table) */}
        <g transform={`translate(${girlX} 662)`}>
          <Girl armAngle={armAngle} leftArmAngle={leftArmAngle} holdingKnife={holdingKnife} expression={girlExpression} bob={girlBob} lean={girlLean} />
        </g>
        {/* Momo behind the table (after his strawberry attempt, until he flies) */}
        {!flying && !momoInFront && (
          <g transform={`translate(${momoX} ${momoY + momoHopY})`}>
            <MomoArt scale={0.75} pose={{ armL: momoArmL, armR: momoArmR, mouthO: momoMouthO, bodyRot: momoBodyRot, eyeScale: momoEyeScale, eyesClosed: time >= 21 && time < 25 && Math.sin(time * 8) > 0.6 }} />
          </g>
        )}
        {/* table + cake */}
        <g transform="translate(800 640)"><Table width={270} /></g>
        <g transform="translate(800 636)"><Cake cut={cut} flicker={flicker} sparkle={sparkle} /></g>
        {/* Momo sneaking up in front of the table during his gag */}
        {!flying && momoInFront && (
          <g transform={`translate(${momoX} ${momoY + momoHopY})`}>
            <MomoArt scale={0.75} pose={{ armL: momoArmL, armR: momoArmR, mouthO: momoMouthO, bodyRot: momoBodyRot, eyeScale: momoEyeScale }} />
          </g>
        )}
        {/* bunny in front */}
        <g transform={`translate(${bunnyX} ${bunnyY})`}>
          <Bunny hop={bunnyHopPhase + bunnyCelebrate} glare={bunnyGlare} flower={time >= 4 && time < 21} />
        </g>
        {/* kitten */}
        <g transform={`translate(${kittenX} 730)`}><Kitten facing={-1} tailWag={kittenWag} /></g>
        {/* confetti */}
        {confettiOn &&
          Array.from({ length: 70 }, (_, i) => {
            const t0 = 21 + prand(i, 1) * 1.6;
            if (time < t0) return null;
            const life = time - t0;
            const x = 250 + prand(i, 2) * 1100 + Math.sin(life * 3 + i) * 30;
            const y = 220 + life * (110 + prand(i, 3) * 80);
            if (y > 900) return null;
            const c = [PALETTE.pineapple, PALETTE.pink, PALETTE.lavender, PALETTE.mint, "#fff"][i % 5];
            return <rect key={i} x={x} y={y} width={9} height={6} fill={c} transform={`rotate(${life * 240 + i * 40} ${x} ${y})`} opacity={0.95} />;
          })}
        {/* the balloon arriving (shot 7) */}
        {time >= 24.8 && !flying && (
          <g transform={`translate(${balloonX} ${balloonY})`}>
            <Balloon scale={1.1} swing={Math.sin(time * 2) * 6} />
          </g>
        )}
      </g>

      {/* Momo flying with the balloon — in screen space so he can grow past the camera */}
      {flying && (
        <g transform={`translate(${800 + (flyX - 800) * 1} ${450 + (flyY - 650) * 0.5}) scale(${flyScale / 0.75})`}>
          <g transform="translate(0 -170)"><Balloon scale={0.75} swing={Math.sin(time * 4) * 8} /></g>
          <MomoArt scale={0.75} pose={{ armL: momoArmL, armR: momoArmR, mouthO: momoMouthO, bodyRot: momoBodyRot, eyeScale: momoEyeScale }} />
        </g>
      )}

      {/* portal */}
      {portal > 0 && (
        <g>
          <circle cx="800" cy="450" r={portal * 1500} fill="url(#film-portal)" />
          <g transform={`translate(800 450) scale(${portal * 2.4})`} opacity={clamp(portal * 1.5)}>
            {[-40, -15, 10, 36].map((a, i) => (
              <path key={i} d="M0 -46 C-10 -70 -4 -92 4 -104 C16 -88 12 -66 0 -46Z" fill="#6FBF93" transform={`rotate(${a} 0 -46)`} />
            ))}
            <ellipse cx="0" cy="-16" rx="28" ry="36" fill="#F2B443" />
            <ellipse cx="0" cy="-16" rx="28" ry="36" fill="url(#cast-hatch)" />
          </g>
        </g>
      )}

      {/* vignette */}
      <rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#film-vignette)" pointerEvents="none" />

      {showCaption && portal < 0.8 && (
        <g transform={`translate(${aspect === "portrait" ? 800 : 800} 840)`}>
          <rect x="-520" y="-30" width="1040" height="58" rx="29" fill="#16152E" opacity="0.55" />
          <text x="0" y="8" textAnchor="middle" fill="#FFF5DF" fontFamily="Fraunces, Georgia, serif" fontSize="26" fontStyle="italic">
            {shot.caption}
          </text>
        </g>
      )}
    </svg>
  );
}
