/**
 * Single asset registry. Every external media file the experience *could* use is listed here.
 * A `null` path means "not supplied" and the UI must show its honest fallback.
 * See docs/asset-manifest.md for how to produce and drop in each asset.
 */
export interface AssetManifest {
  film: {
    landscapeMp4: string | null;
    portraitMp4: string | null;
    poster: string | null;
    captionsVtt: string | null;
    /** Original synthesized soundtrack rendered to WAV/MP3 by scripts/render-film.mjs. */
    soundtrack: string | null;
  };
  music: {
    /** Optional pre-recorded background loop. When null the Web Audio synth plays the original tune. */
    backgroundLoop: string | null;
  };
  voice: {
    /** The creator's own birthday message. Hidden entirely when null. Never synthesized. */
    greeting: string | null;
    transcript: string | null;
  };
}

export const assets: AssetManifest = {
  film: {
    landscapeMp4: "/film/birthday-film-landscape.mp4",
    portraitMp4: "/film/birthday-film-portrait.mp4",
    poster: "/film/birthday-film-poster.webp",
    captionsVtt: "/film/birthday-film-captions.vtt",
    soundtrack: "/music/pineapple-waltz-hop.wav",
  },
  music: {
    backgroundLoop: null,
  },
  voice: {
    greeting: null,
    transcript:
      "Hey Anshu, happy birthday! I hope this silly little birthday adventure made you smile. Have a wonderful year ahead, with lots of laughter, happiness, and cake. Happy birthday, Pineapple!",
  },
};

/** Resolves whether a public asset actually exists (HEAD request), so missing files fall back cleanly. */
export async function assetExists(path: string | null): Promise<boolean> {
  if (!path || typeof window === "undefined") return false;
  try {
    const res = await fetch(path, { method: "HEAD", cache: "no-store" });
    if (!res.ok) return false;
    const type = res.headers.get("content-type") ?? "";
    // Next.js serves an HTML 404 page for missing public files in some modes; guard against it.
    return !type.includes("text/html");
  } catch {
    return false;
  }
}
