"use client";
import { useEffect, useState } from "react";
import { FilmStage, FILM_DURATION } from "@/components/film/FilmStage";
import { audioBufferToWav, bytesToBase64, renderSoundtrack } from "@/lib/renderSoundtrack";

declare global {
  interface Window {
    __setFilmTime?: (t: number, aspect?: "landscape" | "portrait") => void;
    __renderSoundtrack?: (seconds?: number) => Promise<string>;
    __filmReady?: boolean;
  }
}

export function FilmRenderHarness() {
  const [t, setT] = useState(0);
  const [aspect, setAspect] = useState<"landscape" | "portrait">("landscape");
  // Client-only render: avoids SSR/CSR floating-point drift in the many sin()-driven attributes.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    window.__setFilmTime = (next, a) => {
      if (a) setAspect(a);
      setT(next);
    };
    window.__renderSoundtrack = async (seconds = FILM_DURATION) => bytesToBase64(audioBufferToWav(await renderSoundtrack(seconds)));
    window.__filmReady = true;
    return () => {
      delete window.__setFilmTime;
      delete window.__renderSoundtrack;
      delete window.__filmReady;
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#16152E" }} data-film-time={mounted ? t.toFixed(3) : "pending"}>
      {mounted && <FilmStage t={t} aspect={aspect} className="absolute inset-0 h-full w-full" />}
    </div>
  );
}
