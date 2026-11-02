"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MomoMascot, type MomoHandle } from "@/components/MomoMascot";
import { StarField } from "@/components/effects/StarField";
import { ageLabel, computeAge, getZonedParts, isBirthdayToday, nextBirthday, pad2 } from "@/lib/birthdayAge";
import { audio } from "@/lib/audioController";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { SceneNav } from "@/components/SceneShell";

const DATE_CHARS = "04 · 02 · 1999".split("");
const HEADLINE_WORDS = ["Happy", "Birthday,", "Anshu!"];

function useKolkataClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const first = window.requestAnimationFrame(() => setNow(new Date()));
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.cancelAnimationFrame(first);
      window.clearInterval(id);
    };
  }, []);
  return now;
}

export function BirthdayIntroScene({ nav, musicEnabled, onEnableMusic }: { nav: SceneNav; musicEnabled: boolean; onEnableMusic: () => void }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"digits" | "headline">(reduced ? "headline" : "digits");
  const [ripple, setRipple] = useState(0);
  const momo = useRef<MomoHandle>(null);
  const now = useKolkataClock();

  // Digits → headline morph.
  useEffect(() => {
    const t = window.setTimeout(() => setPhase("headline"), reduced ? 30 : 2600);
    return () => window.clearTimeout(t);
  }, [reduced]);

  // Momo's entrance: peek → wave → the hat-drop gag.
  useEffect(() => {
    const t1 = window.setTimeout(() => momo.current?.play("peek"), reduced ? 100 : 900);
    const t2 = window.setTimeout(() => momo.current?.play("wave"), reduced ? 200 : 2200);
    const t3 = window.setTimeout(() => momo.current?.play("hat_drop"), reduced ? 300 : 4100);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [reduced]);

  const age = now ? computeAge(now) : null;
  const birthday = now ? isBirthdayToday(now) : false;
  const upcoming = now ? nextBirthday(now) : null;
  const parts = now ? getZonedParts(now) : null;

  const sparkle = () => {
    setRipple((r) => r + 1);
    audio.sfx("sparkle");
  };

  const celebrate = () => {
    audio.sfx("chime");
    nav.next();
  };

  return (
    <section className="scene" aria-label="Scene 1: Birthday intro" style={{ background: "radial-gradient(120% 80% at 50% 110%, #5b4ab8 0%, #2a2457 38%, var(--indigo) 75%)" }}>
      <StarField />
      {/* moon glow + wispy clouds */}
      <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full opacity-70 blur-3xl" style={{ background: "radial-gradient(circle, rgba(255,245,223,0.55), rgba(187,169,247,0) 70%)" }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              left: `${-10 + i * 35}%`,
              bottom: `${-8 + i * 6}%`,
              width: `${55 - i * 8}%`,
              height: `${34 - i * 6}%`,
              background: `rgba(216,205,251,${0.22 - i * 0.05})`,
              animation: reduced ? undefined : `drift ${9 + i * 2}s ease-in-out ${i}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 pb-10 pt-24 text-center">
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
          04 February · A day worth celebrating
        </motion.p>

        {/* Date digits → headline */}
        <div className="relative mt-4 flex min-h-[7.5rem] items-center justify-center sm:min-h-[9rem]">
          <AnimatePresence mode="wait">
            {phase === "digits" ? (
              <motion.button
                key="digits"
                type="button"
                onClick={sparkle}
                aria-label="Birth date: 4 February 1999. Tap for sparkles."
                className="display relative flex flex-wrap justify-center gap-[0.05em] bg-transparent text-[2.9rem] font-semibold text-honey sm:text-[4.5rem]"
                style={{ textShadow: "0 0 24px rgba(248,200,106,0.55), 0 2px 0 rgba(255,255,255,0.15)", border: 0 }}
                initial="hidden"
                animate="show"
                exit="scatter"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } }, scatter: { transition: { staggerChildren: 0.02 } } }}
              >
                {DATE_CHARS.map((ch, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    style={{ width: ch === " " ? "0.25em" : undefined }}
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.6, filter: "blur(6px)" },
                      show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                      scatter: {
                        opacity: 0,
                        y: -40 - ((i * 37) % 60),
                        x: ((i * 53) % 90) - 45,
                        scale: 0.2,
                        rotate: ((i * 71) % 90) - 45,
                        filter: "blur(4px)",
                        transition: { duration: 0.55, ease: "easeIn" },
                      },
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.button>
            ) : (
              <motion.h1
                key="headline"
                className="display text-[2.6rem] leading-[1.05] text-cream sm:text-[4.4rem]"
                style={{ textShadow: "0 2px 30px rgba(187,169,247,0.35)" }}
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14 } } }}
              >
                {HEADLINE_WORDS.map((w, i) => (
                  <motion.span
                    key={i}
                    className="mr-[0.28em] inline-block"
                    variants={{
                      hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
                      show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    {w === "Anshu!" ? <span style={{ color: "var(--pineapple)" }}>{w}</span> : w}
                  </motion.span>
                ))}
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {phase === "headline" && (
            <motion.div className="mt-3 flex flex-col items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
              <p className="max-w-[22rem] text-base text-cream/85 sm:text-lg">A tiny world of surprises is waiting for you.</p>
              <button
                type="button"
                onClick={sparkle}
                className="relative rounded-full border border-honey/30 bg-honey/10 px-4 py-1.5 text-sm font-bold tracking-[0.18em] text-honey"
                aria-label="Birth date 04 02 1999. Tap for sparkles."
              >
                04 · 02 · 1999
                {ripple > 0 && (
                  <span key={ripple} className="pointer-events-none absolute inset-0 rounded-full" style={{ animation: "rise-fade 0.8s ease-out forwards", boxShadow: "0 0 0 2px var(--pineapple), 0 0 30px 8px rgba(255,215,94,0.6)" }} aria-hidden="true" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Age ring + Momo peek */}
        <div className="relative mt-7 h-[190px] w-[260px]">
          <motion.div className="absolute left-1/2 top-0 -translate-x-1/2" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <div className="relative h-[170px] w-[170px]">
              <svg className={`absolute inset-0 ${reduced ? "" : "anim-spin-slow"}`} viewBox="0 0 170 170" aria-hidden="true">
                <circle cx="85" cy="85" r="78" fill="none" stroke="rgba(248,200,106,0.35)" strokeWidth="1.5" />
                <circle cx="85" cy="85" r="78" fill="none" stroke="var(--honey)" strokeWidth="2.5" strokeDasharray="4 10" strokeLinecap="round" />
                {[0, 90, 180, 270].map((a) => (
                  <circle key={a} cx={85 + Math.cos((a * Math.PI) / 180) * 78} cy={85 + Math.sin((a * Math.PI) / 180) * 78} r="3.5" fill="var(--pineapple)" />
                ))}
              </svg>
              <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full" style={{ background: "radial-gradient(circle at 40% 30%, rgba(255,245,223,0.16), rgba(22,21,46,0.35))", boxShadow: "inset 0 0 30px rgba(248,200,106,0.18), 0 0 40px rgba(248,200,106,0.18)" }}>
                <span className="display text-5xl leading-none text-pineapple" aria-live="polite" data-testid="age-number">
                  {age ?? "·"}
                </span>
                <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cream/80">{age !== null ? ageLabel(age).replace(/^\d+\s/, "") : "wonderful years"}</span>
                {upcoming && (
                  <span className="mt-1 text-[11px] text-cream/60">
                    {birthday ? "It’s today!" : upcoming.daysUntil === 1 ? "tomorrow!" : `${upcoming.daysUntil} days to go`}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
          {/* Momo rises from behind the ring (clipped) */}
          <div className="pointer-events-none absolute left-1/2 top-[52px] h-[150px] w-[150px] translate-x-[26px] overflow-hidden">
            <div className="pointer-events-auto absolute bottom-0 left-2">
              <MomoMascot ref={momo} size={110} tapClip="hat_drop" onTap={() => audio.sfx("boing")} label="Momo the monkey peeking out from behind the clock" />
            </div>
          </div>
        </div>

        {/* live clock */}
        {parts && (
          <p className="mt-2 text-xs tracking-[0.2em] text-cream/55" aria-label="Current time in Asia/Kolkata">
            {pad2(parts.hour)}:{pad2(parts.minute)}:{pad2(parts.second)} IST
          </p>
        )}

        <motion.div className="mt-6 flex flex-col items-center gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.9 }}>
          <button type="button" className="btn btn-primary px-7 text-lg" onClick={celebrate} data-testid="cta-celebrate">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z" fill="currentColor" />
              <path d="M19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z" fill="currentColor" opacity="0.7" />
            </svg>
            Let’s celebrate
          </button>
          {!musicEnabled && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onEnableMusic}>
              Enable music
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
