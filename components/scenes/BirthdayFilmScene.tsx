"use client";
import { useCallback, useEffect, useRef, useState, type Dispatch } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FILM_DURATION, FilmStage, shotAt } from "@/components/film/FilmStage";
import { MomoMascot } from "@/components/MomoMascot";
import { Fireflies } from "@/components/effects/Fireflies";
import { assets, assetExists } from "@/lib/assets";
import { FILM_CUES } from "@/lib/renderSoundtrack";
import { audio } from "@/lib/audioController";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { track } from "@/lib/tracker";
import type { ExperienceAction, FilmStatus } from "@/lib/sceneMachine";
import type { SceneNav } from "@/components/SceneShell";

/** Sound cues for the live (in-browser) film — the same cues are baked into the MP4 soundtrack. */
const CUES = FILM_CUES;

function usePortrait() {
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(
      "(orientation: portrait) and (max-width: 700px)",
    );
    const update = () => setPortrait(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return portrait;
}

export function BirthdayFilmScene({
  nav,
  musicEnabled,
  filmStatus,
  dispatch,
}: {
  nav: SceneNav;
  musicEnabled: boolean;
  filmStatus: FilmStatus;
  dispatch: Dispatch<ExperienceAction>;
}) {
  const reduced = useReducedMotion();
  const portrait = usePortrait();
  const [videoSrc, setVideoSrc] = useState<string | null | undefined>(
    undefined,
  ); // undefined = checking
  const [t, setT] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const raf = useRef(0);
  const last = useRef(0);
  const clock = useRef(0);
  const cueIndex = useRef(0);
  const [momoTapped, setMomoTapped] = useState(false);

  const setStatus = useCallback(
    (status: FilmStatus) => dispatch({ type: "FILM_STATUS", status }),
    [dispatch],
  );

  // Resolve the best real video for this orientation; fall back to the live storybook.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const candidates = portrait
        ? [assets.film.portraitMp4, assets.film.landscapeMp4]
        : [assets.film.landscapeMp4, assets.film.portraitMp4];
      for (const c of candidates) {
        if (await assetExists(c)) {
          if (!cancelled) setVideoSrc(c);
          return;
        }
      }
      if (!cancelled) setVideoSrc(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [portrait]);

  /* ───────── Live storybook clock ───────── */
  const stopClock = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, []);

  const tickRef = useRef<(now: number) => void>(() => {});
  useEffect(() => {
    tickRef.current = (now: number) => {
      const dt = Math.min(0.1, (now - last.current) / 1000);
      last.current = now;
      clock.current = Math.min(FILM_DURATION, clock.current + dt);
      while (
        cueIndex.current < CUES.length &&
        CUES[cueIndex.current].at <= clock.current
      ) {
        audio.sfx(CUES[cueIndex.current].sfx);
        cueIndex.current++;
      }
      setT(clock.current);
      if (clock.current >= FILM_DURATION) {
        setStatus("ended");
        stopClock();
        return;
      }
      raf.current = requestAnimationFrame((n) => tickRef.current(n));
    };
  });

  const playLive = useCallback(() => {
    if (clock.current >= FILM_DURATION) {
      clock.current = 0;
      cueIndex.current = 0;
    }
    last.current = performance.now();
    setStatus("playing");
    stopClock();
    raf.current = requestAnimationFrame((n) => tickRef.current(n));
  }, [setStatus, stopClock]);

  const pauseLive = useCallback(() => {
    stopClock();
    setStatus("paused");
  }, [setStatus, stopClock]);

  useEffect(() => () => stopClock(), [stopClock]);

  /* ───────── Real video ───────── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !musicEnabled;
  }, [musicEnabled, videoSrc]);

  useEffect(() => {
    // While the MP4 plays, hold the synth loop so the two soundtracks never overlap.
    audio.holdMusic(!!videoSrc && filmStatus === "playing");
    return () => audio.holdMusic(false);
  }, [videoSrc, filmStatus]);

  const playVideo = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = !musicEnabled;
      await v.play();
    } catch {
      // Autoplay with sound blocked — retry muted, never leave the visitor stuck.
      try {
        v.muted = true;
        await v.play();
      } catch {
        setStatus("error");
      }
    }
  };

  const isVideo = !!videoSrc;
  const play = () => {
    track("film_play");
    if (isVideo) void playVideo();
    else playLive();
  };
  const pause = () => {
    if (isVideo) videoRef.current?.pause();
    else pauseLive();
  };
  const replay = () => {
    if (isVideo) {
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        void playVideo();
      }
    } else {
      clock.current = 0;
      cueIndex.current = 0;
      setT(0);
      playLive();
    }
  };
  const skip = () => {
    track("film_skip", { seconds: t });
    pause();
    nav.next();
  };

  const playing = filmStatus === "playing";
  const ended = filmStatus === "ended";
  const idle = filmStatus === "idle" || filmStatus === "error";
  const shot = shotAt(t);

  return (
    <section
      className="scene"
      aria-label="Scene 2: The birthday film"
      style={{
        background:
          "radial-gradient(100% 70% at 50% 100%, #3b2f6e 0%, #1f1a3f 45%, var(--indigo) 100%)",
      }}
    >
      <Fireflies count={10} />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-3 pb-6 pt-24 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">Scene two · the birthday film</p>
          <h2 className="display mt-1 text-2xl text-cream sm:text-3xl">
            A little cake-cutting story
          </h2>
        </div>

        {/* Film frame */}
        <div
          className="relative w-full overflow-hidden rounded-[22px] bg-indigo shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]"
          style={{
            aspectRatio: portrait ? "3 / 4" : "16 / 9",
            maxWidth: portrait
              ? "min(100%, 60dvh)"
              : "min(100%, calc((100dvh - 290px) * 16 / 9), 1100px)",
            boxShadow:
              "0 0 0 1px rgba(255,245,223,0.14), 0 0 60px -10px rgba(187,169,247,0.5), 0 40px 80px -30px rgba(0,0,0,0.8)",
          }}
          data-testid="film-frame"
        >
          {isVideo ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src={videoSrc ?? undefined}
              poster={assets.film.poster ?? undefined}
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
              onPlay={() => setStatus("playing")}
              onPause={() =>
                setStatus(
                  videoRef.current && videoRef.current.ended
                    ? "ended"
                    : "paused",
                )
              }
              onEnded={() => {
                setStatus("ended");
                track("film_ended");
                audio.sfx("portal");
              }}
              onWaiting={() => setStatus("loading")}
              onPlaying={() => setStatus("playing")}
              onError={() => {
                setStatus("error");
                setVideoSrc(null);
              }}
              onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
            >
              {assets.film.captionsVtt && (
                <track
                  kind="captions"
                  srcLang="en"
                  label="English"
                  src={assets.film.captionsVtt}
                  default={false}
                />
              )}
            </video>
          ) : (
            <FilmStage
              t={videoSrc === undefined ? 2.5 : t}
              aspect={portrait ? "portrait" : "landscape"}
              className="absolute inset-0 h-full w-full"
              showCaption={!idle}
            />
          )}

          {/* Poster overlay */}
          <AnimatePresence>
            {idle && (
              <motion.div
                key="poster"
                className="absolute inset-0 flex flex-col items-center justify-end gap-4 p-5 text-center"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(22,21,46,0.05) 30%, rgba(22,21,46,0.78) 100%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: { duration: reduced ? 0.1 : 0.9 },
                }}
              >
                <div>
                  <h3
                    className="display text-3xl text-cream sm:text-4xl"
                    style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
                  >
                    The Birthday Film
                  </h3>
                  <p className="mt-1 text-sm text-cream/80">
                    An original animated short · 28 seconds
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary px-7 text-lg"
                  onClick={play}
                  data-testid="play-film"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
                  </svg>
                  Play Birthday Movie
                </button>
                {filmStatus === "error" && (
                  <p className="text-xs text-candy">
                    The video couldn’t start, so the live storybook will play
                    instead.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ended overlay */}
          <AnimatePresence>
            {ended && (
              <motion.div
                key="ended"
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,215,94,0.25), rgba(22,21,46,0.75) 70%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="display text-2xl text-cream sm:text-3xl">
                  Momo found a portal…
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={nav.next}
                  data-testid="film-continue-primary"
                >
                  Follow him to the Pineappleverse
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={replay}
                >
                  Replay the film
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* honesty label */}
          <span
            className="pointer-events-none absolute left-3 top-3 rounded-full bg-indigo/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cream/80 backdrop-blur"
            data-testid="film-source-label"
          >
            {videoSrc === undefined
              ? "Loading…"
              : isVideo
                ? "Original animated film"
                : "Live-animated storybook"}
          </span>

          {/* progress bar */}
          {!idle && (
            <div
              className="pointer-events-none absolute inset-x-4 bottom-2 h-1 overflow-hidden rounded-full bg-cream/20"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-pineapple transition-[width] duration-200"
                style={{ width: `${(t / FILM_DURATION) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          className="flex w-full max-w-[1100px] flex-wrap items-center justify-center gap-2"
          role="group"
          aria-label="Film controls"
        >
          {playing ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={pause}
              data-testid="pause-film"
            >
              Pause
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={play}
              data-testid="play-film-small"
            >
              {filmStatus === "paused" ? "Resume" : "Play"}
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={replay}
          >
            Replay
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={skip}
            data-testid="skip-film"
          >
            Skip film
          </button>
          <button
            type="button"
            className={`btn btn-sm ${ended ? "btn-primary" : "btn-ghost"}`}
            onClick={nav.next}
            data-testid="film-continue"
          >
            Continue →
          </button>
        </div>

        {/* Momo overlay: tap him while the film plays */}
        <div className="pointer-events-none absolute bottom-2 left-2 z-20 flex items-end gap-2 sm:bottom-4 sm:left-4">
          <div className="pointer-events-auto">
            <MomoMascot
              size={78}
              tapClip="surprised"
              emotion={momoTapped ? "surprised" : "happy"}
              onTap={() => {
                setMomoTapped(true);
                audio.sfx("boing");
                window.setTimeout(() => setMomoTapped(false), 1000);
              }}
              label="Momo, who is sneaking around the cake table"
            />
          </div>
          <div
            className="pointer-events-none mb-6 hidden max-w-[12rem] rounded-2xl rounded-bl-sm bg-cream/90 px-3 py-2 text-xs font-semibold text-plum shadow-lg sm:block"
            aria-hidden="true"
          >
            {playing
              ? `Shot ${shot.title}`
              : ended
                ? "Psst… follow me!"
                : "Press play. I promise I won’t touch the cake."}
          </div>
        </div>
      </div>
    </section>
  );
}
