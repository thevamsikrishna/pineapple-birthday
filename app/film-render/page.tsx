import { FilmRenderHarness } from "./FilmRenderHarness";

/**
 * Development-only render harness (NOT one of the four scenes, never linked from the app).
 * scripts/render-film.mjs drives it frame by frame to produce the real MP4 + soundtrack.
 */
export default function FilmRenderPage() {
  if (process.env.NODE_ENV === "production") {
    return <p style={{ padding: 24, fontFamily: "sans-serif" }}>The film render harness is only available in development (`npm run dev`).</p>;
  }
  return <FilmRenderHarness />;
}
