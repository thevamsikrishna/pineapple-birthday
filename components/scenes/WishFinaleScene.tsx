"use client";
import { useCallback, useEffect, useRef, useState, type Dispatch } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MomoMascot, type MomoHandle } from "@/components/MomoMascot";
import { Confetti, type ConfettiHandle } from "@/components/effects/Confetti";
import { Fireworks } from "@/components/effects/Fireworks";
import { Fireflies } from "@/components/effects/Fireflies";
import { StarField } from "@/components/effects/StarField";
import { Bunny, Deer, Defs, Kitten, PALETTE, StringLights, Tree } from "@/components/film/Cast";
import { assets, assetExists } from "@/lib/assets";
import { audio } from "@/lib/audioController";
import { downloadCard } from "@/lib/exportCard";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useViewBoxMapping } from "@/lib/useViewBoxMapping";
import { allCandlesOut, type ExperienceAction } from "@/lib/sceneMachine";
import type { SceneNav } from "@/components/SceneShell";

export const GREETING = {
  title: "Happy Birthday, Pineapple!",
  body: "Here’s to more laughter, more cake, and a year full of wonderful surprises.",
  wish: "May every wish you make tonight find its way back to you.",
  signature: "— Vamsi",
};

const CANDLE_X = [395, 500, 605];
const CANDLE_COLORS = [PALETTE.lavender, PALETTE.pink, PALETTE.mint];
const CAKE_Y = 760;
const VB = { x: 0, y: 250, w: 1000, h: 750 };
const CANDLE_Y = CAKE_Y - 222 - 70; // flame/wick centre in world units
const MOMO = { x: 690, y: 930, w: 150 };

function VoiceGreeting() {
  const [available, setAvailable] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  useEffect(() => {
    let on = true;
    assetExists(assets.voice.greeting).then((ok) => on && setAvailable(ok));
    return () => {
      on = false;
    };
  }, []);
  if (!available || !assets.voice.greeting) return null;
  return (
    <div className="mt-3 w-full rounded-2xl bg-plum/5 p-3 text-left" data-testid="voice-greeting">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum/70">Play a tiny birthday message</p>
      <audio className="mt-2 w-full" controls preload="none" src={assets.voice.greeting} />
      <button type="button" className="mt-2 text-xs font-bold text-plum/70 underline" onClick={() => setShowTranscript((s) => !s)}>
        {showTranscript ? "Hide transcript" : "Show transcript"}
      </button>
      {showTranscript && <p className="mt-1 text-sm text-plum/80">{assets.voice.transcript}</p>}
    </div>
  );
}

export function WishFinaleScene({
  nav,
  candlesOut,
  fireworksTriggered,
  dispatch,
}: {
  nav: SceneNav;
  candlesOut: [boolean, boolean, boolean];
  fireworksTriggered: boolean;
  dispatch: Dispatch<ExperienceAction>;
}) {
  const reduced = useReducedMotion();
  const momo = useRef<MomoHandle>(null);
  const confetti = useRef<ConfettiHandle>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { map, px, ready } = useViewBoxMapping(stage, VB);
  const [showActive, setShowActive] = useState(false);
  const [cardVisible, setCardVisible] = useState(fireworksTriggered);
  const [encore, setEncore] = useState(0);
  const [saved, setSaved] = useState<"idle" | "done" | "failed">("idle");
  const firstRender = useRef(true);
  const allOut = allCandlesOut({ candlesOut });

  const onFireworksDone = useCallback(() => setShowActive(false), []);

  const runShow = useCallback(() => {
    setShowActive(true);
    momo.current?.play("party_pop");
    window.setTimeout(() => confetti.current?.burst(0.78, 0.62, 120), reduced ? 50 : 350);
    audio.sfx("cheer");
  }, [reduced]);

  // After the last candle: micro-pause, then fireworks, confetti mishap, greeting card.
  useEffect(() => {
    if (!fireworksTriggered) return;
    if (firstRender.current && cardVisible) return; // returning visitor: card already up, no re-run
    const t1 = window.setTimeout(runShow, reduced ? 100 : 500);
    const t2 = window.setTimeout(() => setCardVisible(true), reduced ? 300 : 1900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fireworksTriggered, runShow, reduced, encore]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      firstRender.current = false;
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const blow = (i: 0 | 1 | 2) => {
    if (candlesOut[i]) return;
    audio.sfx("puff");
    dispatch({ type: "BLOW_CANDLE", index: i });
  };
  const blowAll = () => {
    audio.sfx("puff");
    dispatch({ type: "BLOW_ALL" });
  };
  const relight = () => {
    audio.sfx("sparkle");
    setSaved("idle");
    setCardVisible(false);
    setShowActive(false);
    dispatch({ type: "RELIGHT_CANDLES" });
  };
  const moreFireworks = () => {
    setEncore((e) => e + 1);
    setShowActive(false);
    window.setTimeout(runShow, 50);
  };
  const saveCard = async () => {
    const ok = await downloadCard({ title: GREETING.title, body: `${GREETING.body} ${GREETING.wish}`, signature: GREETING.signature });
    setSaved(ok ? "done" : "failed");
    if (ok) audio.sfx("sparkle");
  };

  return (
    <section className="scene" aria-label="Scene 4: Make a wish finale" style={{ background: "linear-gradient(180deg, #100f24 0%, #2a2457 42%, #6a4e92 72%, #c98fae 100%)" }}>
      <StarField density={0.9} />
      <Fireflies count={18} />
      <Fireworks active={showActive} onDone={onFireworksDone} />
      <Confetti ref={confetti} className="z-30" />

      {/* wish lanterns rise during the celebration */}
      {fireworksTriggered && !reduced && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <style>{`@keyframes lantern-rise { 0% { transform: translateY(0) translateX(0); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(-120vh) translateX(var(--sway)); opacity: 0; } }`}</style>
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={`${encore}-${i}`}
              className="absolute bottom-[-60px] block rounded-[40%_40%_45%_45%]"
              style={
                {
                  left: `${8 + i * 12}%`,
                  width: 18 + (i % 3) * 6,
                  height: 26 + (i % 3) * 8,
                  background: "radial-gradient(circle at 50% 40%, #FFF3C4, #F8C86A 60%, #E99A4D)",
                  boxShadow: "0 0 24px 8px rgba(255,215,94,0.45)",
                  "--sway": `${(i % 2 ? 1 : -1) * (20 + i * 6)}px`,
                  animation: `lantern-rise ${14 + (i % 4) * 3}s linear ${i * 0.9}s forwards`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col items-center px-3 pb-4 pt-[88px] sm:pt-24">
        <div className="text-center">
          <h2 className="display text-[1.7rem] leading-tight text-cream sm:text-4xl" style={{ textShadow: "0 2px 24px rgba(187,169,247,0.4)" }}>
            One more birthday wish…
          </h2>
          <p className="mt-1 text-sm text-cream/85 sm:text-base" aria-live="polite">
            {allOut ? "Wish made. Let the sky celebrate." : "Tap the candles to make a wish."}
          </p>
        </div>

        {/* Diorama */}
        <div ref={stage} className="relative my-2 w-full flex-1 overflow-hidden rounded-[28px]" style={{ maxWidth: 700, minHeight: 260 }} data-testid="finale-diorama">
          <div className="absolute inset-0">
            <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <Defs prefix="cast" />
              <defs>
                <linearGradient id="fin-table" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F3E9FF" />
                  <stop offset="100%" stopColor="#B9A7EC" />
                </linearGradient>
                <linearGradient id="fin-cake-a" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFE3EE" />
                  <stop offset="100%" stopColor="#F2A8C8" />
                </linearGradient>
                <linearGradient id="fin-cake-b" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E9E1FF" />
                  <stop offset="100%" stopColor="#B9A7EC" />
                </linearGradient>
                <linearGradient id="fin-cake-c" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFF1C9" />
                  <stop offset="100%" stopColor="#F8C86A" />
                </linearGradient>
              </defs>
              {/* distant hills + trees in twilight */}
              <path d="M-100 820 Q200 660 500 760 Q800 860 1100 720 L1100 1100 L-100 1100Z" fill="#2a2457" opacity="0.9" />
              <g transform="translate(150 820)" opacity="0.85"><Tree canopy="lav" scale={0.8} /></g>
              <g transform="translate(850 800)" opacity="0.85"><Tree canopy="pink" scale={0.85} /></g>
              <StringLights x1={120} y1={560} x2={880} y2={540} count={11} sag={80} />
              {/* floating table */}
              <ellipse cx="500" cy="830" rx="300" ry="46" fill="#BBA9F7" opacity="0.25" />
              <ellipse cx="500" cy="790" rx="260" ry="36" fill="#D8CDFB" opacity="0.35" />
              <ellipse cx="500" cy="780" rx="250" ry="58" fill="url(#fin-table)" />
              <ellipse cx="500" cy="772" rx="230" ry="44" fill="#EFE6FF" />
              {/* cake: three tiers, three grand candles */}
              <g transform="translate(500 760)">
                <ellipse cx="0" cy="0" rx="190" ry="26" fill="#fff" opacity="0.6" />
                <rect x="-180" y="-90" width="360" height="88" rx="14" fill="url(#fin-cake-a)" />
                <path d="M-170 -84 Q-150 -60 -130 -84 Q-110 -58 -90 -84 Q-70 -60 -50 -84 Q-30 -58 -10 -84 Q10 -60 30 -84 Q50 -58 70 -84 Q90 -60 110 -84 Q130 -58 150 -84 L170 -84 L170 -96 Q0 -108 -170 -96Z" fill="#FFF5DF" />
                <ellipse cx="0" cy="-92" rx="180" ry="22" fill="#FFF9EC" />
                <rect x="-150" y="-160" width="300" height="70" rx="12" fill="url(#fin-cake-b)" />
                <path d="M-130 -154 Q-112 -132 -94 -154 Q-76 -130 -58 -154 Q-40 -132 -22 -154 Q-4 -130 14 -154 Q32 -132 50 -154 Q68 -130 86 -154 Q104 -132 122 -154 L130 -154 L130 -166 Q0 -176 -130 -166Z" fill="#FFF5DF" />
                <ellipse cx="0" cy="-162" rx="150" ry="18" fill="#FFF9EC" />
                <rect x="-128" y="-216" width="256" height="56" rx="10" fill="url(#fin-cake-c)" />
                <path d="M-128 -210 Q-112 -192 -96 -210 Q-80 -190 -64 -210 Q-48 -192 -32 -210 Q-16 -190 0 -210 Q16 -192 32 -210 Q48 -190 64 -210 Q80 -192 96 -210 Q112 -190 128 -210 L128 -222 Q0 -230 -128 -222Z" fill="#FFF5DF" />
                <ellipse cx="0" cy="-218" rx="128" ry="14" fill="#FFF9EC" />
                {/* strawberries + pearls */}
                {[-120, -60, 0, 60, 120].map((x) => (
                  <g key={x} transform={`translate(${x} -100)`}>
                    <path d="M-8 -4 C-8 -14 8 -14 8 -4 C8 5 0 12 0 12 C0 12 -8 5 -8 -4Z" fill="#E2495F" />
                    <path d="M-5 -11 L0 -16 L5 -11 L2 -9 L-2 -9Z" fill={PALETTE.mint} />
                  </g>
                ))}
                {[-70, -35, 0, 35, 70].map((x) => (
                  <circle key={x} cx={x} cy={-166} r="5" fill="#FFF" opacity="0.9" />
                ))}
                {/* candles (sticks); flames are animated separately below */}
                {CANDLE_X.map((x, i) => (
                  <g key={x} transform={`translate(${x - 500} -222)`}>
                    <rect x="-10" y="-70" width="20" height="72" rx="6" fill={CANDLE_COLORS[i]} />
                    <path d="M-10 -58 L10 -58 M-10 -40 L10 -40 M-10 -22 L10 -22" stroke="#fff" strokeOpacity="0.5" strokeWidth="4" />
                    <rect x="-2" y="-82" width="4" height="14" fill="#5E3A2A" />
                    {!candlesOut[i] ? (
                      <g className={reduced ? "" : "anim-flame"} style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
                        <ellipse cx="0" cy="-96" rx="30" ry="40" fill="#FFD75E" opacity="0.16" />
                        <path d="M0 -130 C14 -114 18 -98 12 -86 C8 -78 -8 -78 -12 -86 C-18 -98 -14 -114 0 -130Z" fill="url(#cast-flame)" />
                        <ellipse cx="0" cy="-92" rx="5" ry="10" fill="#FFF9D6" opacity="0.9" />
                      </g>
                    ) : (
                      <g className="anim-pop-in">
                        <path d="M0 -86 C8 -100 -8 -112 0 -126 C8 -140 -6 -150 2 -164" stroke="#D8CDFB" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" style={{ animation: reduced ? undefined : "rise-fade 2.4s ease-out forwards" }} />
                        <circle cx="0" cy="-86" r="4" fill="#FF9A3C" opacity="0.6" />
                      </g>
                    )}
                  </g>
                ))}
              </g>
              {/* party animals */}
              <g transform="translate(300 860)"><Bunny facing={1} /></g>
              <g transform="translate(400 930) scale(0.9)"><Kitten facing={1} tailWag={6} /></g>
              <g transform="translate(220 960) scale(0.7)"><Deer /></g>
              {/* Momo's party cannon */}
              <g transform="translate(600 900) rotate(-35)">
                <rect x="-16" y="-40" width="32" height="70" rx="10" fill="#9C87E8" />
                <rect x="-20" y="-48" width="40" height="18" rx="8" fill="#F5A8CE" />
                <circle cx="0" cy="30" r="12" fill="#5C4A7A" />
              </g>
            </svg>

            {/* Candle hit targets (≥48px, keyboard-focusable) */}
            {ready &&
              CANDLE_X.map((x, i) => {
                const p = map(x, CANDLE_Y);
                return (
                  <button
                    key={x}
                    type="button"
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-0 bg-transparent"
                    style={{ left: p.left, top: p.top, width: px(120, 48), height: px(190, 56) }}
                    onClick={() => blow(i as 0 | 1 | 2)}
                    aria-pressed={candlesOut[i]}
                    aria-label={candlesOut[i] ? `Candle ${i + 1} is out` : `Blow out candle ${i + 1}`}
                    data-testid={`candle-${i}`}
                    disabled={candlesOut[i]}
                  />
                );
              })}

            {/* Momo beside the table with his cannon */}
            {ready && (
              <div className="absolute -translate-x-1/2 -translate-y-full" style={{ ...map(MOMO.x, MOMO.y), width: px(MOMO.w, 70) }}>
                <MomoMascot
                  ref={momo}
                  size={px(MOMO.w, 70)}
                  tapClip="party_pop"
                  onTap={() => {
                    audio.sfx("pop");
                    confetti.current?.burst(0.78, 0.7, 50);
                  }}
                  label="Momo, holding a tiny party cannon"
                />
              </div>
            )}

          </div>
        </div>

        {/* Greeting card */}
        <AnimatePresence>
          {cardVisible && fireworksTriggered && (
            <motion.div
              className="card absolute left-1/2 z-20 w-[92%] max-w-[420px] -translate-x-1/2 px-5 py-5 text-center sm:px-7"
              style={{ top: "max(env(safe-area-inset-top), 12px)", marginTop: 72 }}
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              role="dialog"
              aria-label="Birthday greeting"
              data-testid="greeting-card"
            >
              <p className="eyebrow !text-plum/60">With love from the Pineappleverse</p>
              <h3 className="display mt-1 text-[1.65rem] leading-tight sm:text-3xl">{GREETING.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-plum/85 sm:text-base">{GREETING.body}</p>
              <p className="mt-2 text-sm italic leading-relaxed text-plum/70" style={{ fontFamily: "var(--font-display)" }}>
                {GREETING.wish}
              </p>
              <p className="display mt-3 text-lg italic">{GREETING.signature}</p>
              <VoiceGreeting />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Controls */}
        <div className="flex w-full max-w-[640px] flex-wrap items-center justify-center gap-2">
          {!allOut ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={blowAll} data-testid="blow-all">
              Blow all candles
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-primary btn-sm" onClick={nav.replayAdventure} data-testid="replay-adventure">
                Replay the Adventure
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => nav.goTo("film")} data-testid="watch-again">
                Watch the Birthday Movie Again
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={saveCard} data-testid="save-card">
                {saved === "done" ? "Card saved ✓" : saved === "failed" ? "Couldn’t save, try again" : "Save a Birthday Card"}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={moreFireworks} disabled={showActive}>
                More fireworks
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={relight} data-testid="relight">
                Light the candles again
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
