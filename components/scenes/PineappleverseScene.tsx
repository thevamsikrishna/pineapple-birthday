"use client";
import { useEffect, useMemo, useRef, useState, type Dispatch } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MomoMascot, type MomoHandle } from "@/components/MomoMascot";
import { Confetti, type ConfettiHandle } from "@/components/effects/Confetti";
import { StarField } from "@/components/effects/StarField";
import {
  Balloon,
  Cloud,
  Defs,
  GiftBox,
  PineappleBush,
  PineappleHouse,
  StringLights,
  Tree,
  PALETTE,
} from "@/components/film/Cast";
import {
  ALL_COLLECTIBLES,
  allSurprisesFound,
  type Collectible,
  type ExperienceAction,
} from "@/lib/sceneMachine";
import { audio } from "@/lib/audioController";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useViewBoxMapping } from "@/lib/useViewBoxMapping";
import { track } from "@/lib/tracker";
import type { SceneNav } from "@/components/SceneShell";

const HINTS: Record<Collectible, string> = {
  "singing-pineapple": "Psst… that bush over there hums when nobody’s looking.",
  balloon: "That banana balloon keeps drifting my way. Send it over?",
  gift: "A gift box with no name tag? Suspicious. Delicious, maybe.",
};
const DONE_HINTS = [
  "You found everything! I’m so proud I could do a backflip.",
  "Ready to make a wish? The candles are waiting.",
];

/* World coordinates (viewBox units) of everything interactive */
const VB = { x: 0, y: 150, w: 1000, h: 850 };
const POS = {
  momo: { x: 430, y: 700, w: 150 },
  bush: { x: 690, y: 690 },
  gift: { x: 480, y: 830 },
  balloonHome: { x: 680, y: 330 },
  balloonMomo: { x: 430, y: 470 },
};

export function PineappleverseScene({
  nav,
  collected,
  dispatch,
}: {
  nav: SceneNav;
  collected: Collectible[];
  dispatch: Dispatch<ExperienceAction>;
}) {
  const reduced = useReducedMotion();
  const momo = useRef<MomoHandle>(null);
  const confetti = useRef<ConfettiHandle>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { map, px, ready } = useViewBoxMapping(stage, VB);
  const [hint, setHint] = useState<string>(
    "Momo hid three birthday surprises. Can you find them?",
  );
  const [bushWiggle, setBushWiggle] = useState(0);
  const [golden, setGolden] = useState(
    collected.includes("singing-pineapple") ? 1 : 0,
  );
  const [balloonTravel, setBalloonTravel] = useState<
    "home" | "flying" | "momo"
  >(collected.includes("balloon") ? "momo" : "home");
  const [hatToken, setHatToken] = useState(collected.includes("balloon"));
  const [giftOpen, setGiftOpen] = useState(collected.includes("gift") ? 1 : 0);
  const [giftMessage, setGiftMessage] = useState(false);
  const [completeShown, setCompleteShown] = useState(false);
  const found = collected.length;
  const complete = allSurprisesFound({ collected });
  const has = (c: Collectible) => collected.includes(c);

  // Completion celebration (runs once per visit when the third surprise lands).
  useEffect(() => {
    if (!complete || completeShown) return;
    const t = window.setTimeout(
      () => {
        setCompleteShown(true);
        momo.current?.play("dance");
        confetti.current?.burst(0.5, 0.45, 140);
        audio.sfx("tada");
        setHint(DONE_HINTS[0]);
      },
      reduced ? 120 : 700,
    );
    return () => window.clearTimeout(t);
  }, [complete, completeShown, reduced]);

  const remaining = useMemo(
    () => ALL_COLLECTIBLES.filter((c) => !collected.includes(c)),
    [collected],
  );

  const momoHint = () => {
    if (remaining.length === 0)
      setHint(DONE_HINTS[Math.floor(Math.random() * DONE_HINTS.length)]);
    else
      setHint(HINTS[remaining[Math.floor(Math.random() * remaining.length)]]);
    audio.sfx("pop");
  };

  /* ── Surprise A: the singing pineapple ── */
  const tapBush = () => {
    setBushWiggle((n) => n + 1);
    audio.sfx("pluck");
    if (has("singing-pineapple")) return;
    window.setTimeout(
      () => {
        setGolden(1);
        audio.sfx("chime");
        dispatch({ type: "COLLECT", item: "singing-pineapple" });
        track("surprise_found", { detail: "singing pineapple" });
        momo.current?.play("dance");
        setHint("It sings! A golden pineapple! That’s one.");
      },
      reduced ? 50 : 450,
    );
  };

  /* ── Surprise B: the mischievous balloon ── */
  const tapBalloon = () => {
    if (balloonTravel !== "home") {
      audio.sfx("boing");
      momo.current?.play("hop");
      return;
    }
    setBalloonTravel("flying");
    audio.sfx("whoosh");
    window.setTimeout(
      () => {
        setBalloonTravel("momo");
        momo.current?.play("float");
        audio.sfx("boing");
        window.setTimeout(
          () => {
            setHatToken(true);
            audio.sfx("sparkle");
            dispatch({ type: "COLLECT", item: "balloon" });
            track("surprise_found", { detail: "balloon" });
            setHint(
              "Whee! Look in my hat, there was a token in there the whole time.",
            );
          },
          reduced ? 100 : 1500,
        );
      },
      reduced ? 50 : 1200,
    );
  };

  /* ── Surprise C: the mystery gift ── */
  const tapGift = () => {
    if (has("gift")) {
      setGiftMessage(true);
      audio.sfx("pop");
      return;
    }
    setGiftOpen(1);
    audio.sfx("tada");
    confetti.current?.burst(0.47, 0.72, 60);
    window.setTimeout(
      () => {
        setGiftMessage(true);
        dispatch({ type: "COLLECT", item: "gift" });
        track("surprise_found", { detail: "mystery gift" });
        momo.current?.play("clap");
        setHint("Extra cake? Extra cake! That’s the best one.");
      },
      reduced ? 50 : 600,
    );
  };

  const momoPx = map(POS.momo.x, POS.momo.y);
  const momoW = px(POS.momo.w, 64);
  const bushPx = map(POS.bush.x, POS.bush.y);
  const giftPx = map(POS.gift.x, POS.gift.y);
  const balloonPx =
    balloonTravel === "home"
      ? map(POS.balloonHome.x, POS.balloonHome.y)
      : map(POS.balloonMomo.x, POS.balloonMomo.y);

  return (
    <section
      className="scene"
      aria-label="Scene 3: Pineappleverse playground"
      style={{
        background:
          "linear-gradient(180deg, #2b2457 0%, #6f5fcf 40%, #bba9f7 72%, #ffd1b0 100%)",
      }}
    >
      <StarField density={0.5} shooting={false} className="opacity-70" />
      <Confetti ref={confetti} className="z-30" />

      <div className="relative z-10 flex h-full flex-col items-center px-3 pb-3 pt-[84px] sm:pt-24">
        <div className="flex w-full max-w-[760px] items-end justify-between gap-2">
          <div>
            <p className="eyebrow">Scene three · Pineappleverse</p>
            <h2 className="display text-xl leading-tight text-cream sm:text-2xl">
              A tiny floating birthday island
            </h2>
          </div>
          <div
            className="glass flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-bold"
            aria-live="polite"
            data-testid="surprise-progress"
          >
            <span className="flex gap-1" aria-hidden="true">
              {ALL_COLLECTIBLES.map((c) => (
                <span
                  key={c}
                  className="block h-2.5 w-2.5 rounded-full transition-colors"
                  style={{
                    background: has(c)
                      ? "var(--pineapple)"
                      : "rgba(255,245,223,0.3)",
                    boxShadow: has(c) ? "0 0 8px var(--pineapple)" : undefined,
                  }}
                />
              ))}
            </span>
            {found} / 3
          </div>
        </div>

        {/* Diorama stage: SVG fills it (slice); HTML hit targets are mapped to world coordinates */}
        <div
          ref={stage}
          className="relative my-2 w-full flex-1 overflow-hidden rounded-[28px]"
          style={{
            maxWidth: 760,
            minHeight: 280,
            boxShadow: "inset 0 0 0 1px rgba(255,245,223,0.12)",
          }}
          data-testid="diorama"
        >
          <svg
            viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <Defs prefix="cast" />
            <defs>
              <linearGradient id="pv-grass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B5EBD0" />
                <stop offset="100%" stopColor="#6FBF93" />
              </linearGradient>
              <linearGradient id="pv-rock" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F2B443" />
                <stop offset="100%" stopColor="#B87828" />
              </linearGradient>
              <radialGradient id="pv-pond" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#CFF3FF" />
                <stop offset="100%" stopColor="#7FC2E8" />
              </radialGradient>
            </defs>
            {/* clouds */}
            <g
              className={reduced ? "" : "anim-drift"}
              style={{ animationDuration: "11s" }}
            >
              <g transform="translate(150 230)">
                <Cloud scale={0.6} opacity={0.75} />
              </g>
              <g transform="translate(760 200)">
                <Cloud scale={0.5} opacity={0.7} />
              </g>
              <g transform="translate(520 150)">
                <Cloud scale={0.4} opacity={0.5} />
              </g>
            </g>
            {/* decorative balloons */}
            <g
              transform="translate(265 330)"
              className={reduced ? "" : "anim-bob"}
            >
              <Balloon scale={0.7} color="#F5A8CE" />
            </g>
            <g
              transform="translate(310 370)"
              className={reduced ? "" : "anim-drift"}
            >
              <Balloon scale={0.6} color="#BBA9F7" />
            </g>
            {/* island glow */}
            <ellipse
              cx="500"
              cy="760"
              rx="440"
              ry="240"
              fill="#FFD75E"
              opacity="0.18"
            />
            {/* island underside: pineapple skin */}
            <path
              d="M110 700 C120 880 320 960 500 980 C680 960 880 880 890 700 Z"
              fill="url(#pv-rock)"
            />
            <path
              d="M110 700 C120 880 320 960 500 980 C680 960 880 880 890 700 Z"
              fill="url(#cast-hatch)"
            />
            {[-30, -10, 10, 30].map((a, i) => (
              <path
                key={i}
                d="M0 0 C-10 40 -4 80 6 110 C18 80 14 40 0 0Z"
                fill="#6FBF93"
                transform={`translate(500 960) rotate(${a + 180} 0 0)`}
                opacity="0.9"
              />
            ))}
            {/* island top */}
            <ellipse
              cx="500"
              cy="700"
              rx="400"
              ry="140"
              fill="url(#pv-grass)"
            />
            <ellipse
              cx="500"
              cy="690"
              rx="340"
              ry="105"
              fill="#A9E2C4"
              opacity="0.5"
            />
            {/* pond + bridge */}
            <ellipse cx="640" cy="760" rx="110" ry="44" fill="url(#pv-pond)" />
            <ellipse
              cx="620"
              cy="752"
              rx="40"
              ry="10"
              fill="#fff"
              opacity="0.35"
            />
            <g transform="translate(560 700)">
              <path
                d="M-70 40 Q0 -20 70 40"
                stroke="#B57A52"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
              />
              {[-50, -25, 0, 25, 50].map((x) => (
                <path
                  key={x}
                  d={`M${x} ${40 - (1 - (x / 50) ** 2) * 48} v-26`}
                  stroke="#8E5A3C"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              ))}
            </g>
            {/* duck (ambient creature) */}
            <g
              transform="translate(660 762)"
              className={reduced ? "" : "anim-bob"}
            >
              <ellipse cx="0" cy="0" rx="20" ry="13" fill="#FFF0A8" />
              <circle cx="14" cy="-12" r="9" fill="#FFF0A8" />
              <path d="M22 -12 L32 -9 L22 -6Z" fill="#F2B443" />
              <circle cx="16" cy="-14" r="2" fill={PALETTE.plum} />
            </g>
            {/* trees */}
            <g transform="translate(130 660)">
              <Tree canopy="pink" scale={0.75} />
            </g>
            <g transform="translate(860 640)">
              <Tree canopy="lav" scale={0.8} />
            </g>
            <g transform="translate(930 740)">
              <Tree canopy="mint" scale={0.55} />
            </g>
            {/* string lights */}
            <StringLights
              x1={140}
              y1={520}
              x2={850}
              y2={500}
              count={10}
              sag={70}
            />
            {/* pineapple house */}
            <g transform="translate(300 700) scale(0.72)">
              <PineappleHouse />
            </g>
            {/* flowers */}
            {Array.from({ length: 18 }, (_, i) => {
              const x = 160 + ((i * 173) % 680);
              const y = 640 + ((i * 97) % 150);
              const c = [
                PALETTE.pink,
                PALETTE.pineapple,
                "#fff",
                PALETTE.lavender,
              ][i % 4];
              return (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <path d="M0 0 L0 -12" stroke="#4FA87A" strokeWidth="2" />
                  <circle cx="0" cy="-14" r="4" fill={c} />
                </g>
              );
            })}
            {/* Surprise A bush */}
            <g transform={`translate(${POS.bush.x} ${POS.bush.y})`}>
              <g
                key={bushWiggle}
                className={bushWiggle ? "anim-wiggle" : ""}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "50% 100%",
                }}
              >
                <PineappleBush golden={golden} />
              </g>
              {!has("singing-pineapple") && (
                <g
                  className={reduced ? "" : "anim-twinkle"}
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                >
                  <circle cx="0" cy="-50" r="70" fill="#FFD75E" opacity="0.2" />
                </g>
              )}
            </g>
            {/* Surprise C gift */}
            <g transform={`translate(${POS.gift.x} ${POS.gift.y}) scale(0.75)`}>
              {!has("gift") && (
                <g
                  className={reduced ? "" : "anim-twinkle"}
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                >
                  <circle
                    cx="0"
                    cy="-40"
                    r="80"
                    fill="#FFD75E"
                    opacity="0.22"
                  />
                </g>
              )}
              <GiftBox open={giftOpen} />
              {giftOpen > 0 && (
                <g
                  className="anim-pop-in"
                  transform="translate(0 -140)"
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                >
                  <circle r="60" fill="#FFD75E" opacity="0.25" />
                  <g transform="scale(1.1)">
                    <rect
                      x="-30"
                      y="-10"
                      width="60"
                      height="30"
                      rx="6"
                      fill="#F5B7D2"
                    />
                    <path
                      d="M-30 -8 Q-20 2 -10 -8 Q0 2 10 -8 Q20 2 30 -8 L30 -14 L-30 -14Z"
                      fill="#FFF5DF"
                    />
                    <rect
                      x="-3"
                      y="-30"
                      width="6"
                      height="18"
                      fill={PALETTE.lavender}
                    />
                    <path
                      d="M0 -40 C4 -34 5 -30 0 -27 C-5 -30 -4 -34 0 -40Z"
                      fill="#FFD75E"
                    />
                  </g>
                </g>
              )}
            </g>
            {/* butterfly (ambient creature) */}
            <g
              transform="translate(240 520)"
              className={reduced ? "" : "anim-firefly"}
              style={{ animationDuration: "7s" }}
            >
              <path
                d="M0 0 C-14 -16 -24 -4 -10 8 Z M0 0 C14 -16 24 -4 10 8 Z"
                fill={PALETTE.pink}
              />
              <path
                d="M0 -4 L0 8"
                stroke={PALETTE.plum}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          </svg>

          {ready && (
            <>
              {/* ── Surprise A hit target ── */}
              <button
                type="button"
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-0 bg-transparent"
                style={{
                  left: bushPx.left,
                  top: bushPx.top - px(40),
                  width: px(190, 56),
                  height: px(190, 56),
                }}
                onClick={tapBush}
                aria-label={
                  has("singing-pineapple")
                    ? "The singing pineapple bush (surprise found). Tap to hear it again."
                    : "A suspiciously musical pineapple bush. Tap to search it."
                }
                data-testid="surprise-bush"
              />

              {/* ── Surprise B: the balloon travels to Momo ── */}
              <motion.button
                type="button"
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border-0 bg-transparent"
                style={{ width: px(150, 52), height: px(240, 64) }}
                initial={false}
                animate={{ left: balloonPx.left, top: balloonPx.top }}
                transition={{
                  duration: reduced ? 0.05 : 1.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={tapBalloon}
                aria-label={
                  has("balloon")
                    ? "The banana balloon, now Momo’s (surprise found)"
                    : "A mischievous banana balloon. Tap to send it to Momo."
                }
                data-testid="surprise-balloon"
              >
                <span
                  className={`block h-full w-full ${reduced ? "" : "anim-bob"}`}
                >
                  <svg
                    viewBox="-75 -120 150 240"
                    className="h-full w-full overflow-visible"
                    aria-hidden="true"
                  >
                    <Defs prefix="pvb" />
                    {!has("balloon") && (
                      <g
                        className={reduced ? "" : "anim-twinkle"}
                        style={{
                          transformBox: "fill-box",
                          transformOrigin: "center",
                        }}
                      >
                        <circle
                          cx="0"
                          cy="-40"
                          r="64"
                          fill="#FFD75E"
                          opacity="0.22"
                        />
                      </g>
                    )}
                    <Balloon prefix="pvb" scale={1} swing={0} />
                  </svg>
                </span>
              </motion.button>

              {/* ── Surprise C hit target ── */}
              <button
                type="button"
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border-0 bg-transparent"
                style={{
                  left: giftPx.left,
                  top: giftPx.top - px(40),
                  width: px(150, 56),
                  height: px(150, 56),
                }}
                onClick={tapGift}
                aria-label={
                  has("gift")
                    ? "The mystery gift (surprise found). Tap to read the message again."
                    : "A mystery gift box. Tap to unwrap it."
                }
                data-testid="surprise-gift"
              />

              {/* Momo by the pineapple house */}
              <div
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{ left: momoPx.left, top: momoPx.top, width: momoW }}
              >
                <MomoMascot
                  ref={momo}
                  size={momoW}
                  tapClip="hop"
                  onTap={momoHint}
                  hatToken={hatToken}
                  label="Momo, standing by his pineapple house"
                />
              </div>

              {/* Momo's speech bubble floats above his head */}
              <AnimatePresence mode="wait">
                {!completeShown && (
                  <motion.div
                    key={hint}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-2xl bg-cream/95 px-3 py-2 text-center text-[11px] font-semibold leading-snug text-plum shadow-lg sm:text-sm"
                    style={{
                      left: momoPx.left,
                      top: momoPx.top - momoW * 1.25 - 10,
                      width: "max-content",
                      maxWidth: Math.max(170, px(420)),
                    }}
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3 }}
                    role="status"
                    data-testid="momo-hint"
                  >
                    {hint}
                    <span
                      className="absolute left-1/2 top-full -ml-2 h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-cream/95"
                      aria-hidden="true"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Gift message */}
          <AnimatePresence>
            {giftMessage && (
              <motion.div
                className="card absolute left-1/2 top-1/2 z-20 w-[82%] max-w-[320px] -translate-x-1/2 -translate-y-1/2 px-5 py-4 text-center"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                role="dialog"
                aria-label="Gift message"
                data-testid="gift-message"
              >
                <p className="display text-lg leading-tight">
                  The best surprises come with extra cake!
                </p>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-3 !bg-plum/10 !text-plum"
                  onClick={() => setGiftMessage(false)}
                >
                  Yum, got it
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion */}
          <AnimatePresence>
            {completeShown && (
              <motion.div
                className="card absolute left-1/2 top-[8%] z-20 w-[86%] max-w-[360px] -translate-x-1/2 px-5 py-4 text-center"
                initial={{ opacity: 0, y: -16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                data-testid="level-complete"
              >
                <svg
                  viewBox="-60 -100 120 110"
                  className="mx-auto h-14 w-14 anim-glow"
                  aria-hidden="true"
                >
                  <Defs prefix="gold" />
                  <GiftBox prefix="gold" golden open={0.2} />
                </svg>
                <p className="display mt-1 text-lg leading-tight">
                  Pineappleverse birthday level: complete!
                </p>
                <button
                  type="button"
                  className="btn btn-primary mt-3"
                  onClick={nav.next}
                  data-testid="make-a-wish"
                >
                  Make a Wish
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex w-full max-w-[760px] items-center justify-center gap-2">
          <button
            type="button"
            className={`btn btn-sm ${complete ? "btn-primary" : "btn-ghost"}`}
            onClick={nav.next}
            data-testid="playground-continue"
          >
            {complete ? "Make a Wish →" : "Continue →"}
          </button>
        </div>
      </div>
    </section>
  );
}
