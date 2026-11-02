/**
 * Renders the Scene 2 birthday film into real MP4 files + poster + soundtrack.
 *
 *   npm run render:film            → landscape 1920×1080 + portrait 1080×1920 (24 fps, 28 s)
 *   FPS=12 node scripts/render-film.mjs   → quicker preview
 *
 * Pipeline: `next dev` serves /film-render → Playwright steps FilmStage frame by frame and
 * screenshots each one → the soundtrack is rendered in-browser with OfflineAudioContext →
 * ffmpeg encodes H.264 + AAC. Output lands in public/film and public/music.
 */
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PORT = Number(process.env.PORT || 3100);
const BASE = `http://localhost:${PORT}/film-render`;
const FPS = Number(process.env.FPS || 24);
const DURATION = 28;
const FRAMES = Math.round(DURATION * FPS);
const WORK = fs.mkdtempSync(path.join(process.env.SCRATCH_DIR || os.tmpdir(), "film-frames-"));
const OUT_FILM = path.join(ROOT, "public/film");
const OUT_MUSIC = path.join(ROOT, "public/music");
fs.mkdirSync(OUT_FILM, { recursive: true });
fs.mkdirSync(OUT_MUSIC, { recursive: true });

const log = (m) => console.log(`[render] ${m}`);

async function waitFor(url, ms = 120000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${url} did not come up`);
}

async function renderOrientation(browser, { name, width, height, aspect }) {
  const dir = path.join(WORK, name);
  fs.mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__filmReady === true, null, { timeout: 120000 });
  // Belt and braces: never let the Next.js dev overlay into a frame.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.evaluate(() => document.fonts.ready);
  log(`${name}: capturing ${FRAMES} frames at ${width}×${height}`);
  const t0 = Date.now();
  for (let i = 0; i < FRAMES; i++) {
    const t = i / FPS;
    await page.evaluate(([tt, a]) => window.__setFilmTime(tt, a), [t, aspect]);
    await page.waitForFunction((tt) => document.querySelector("[data-film-time]")?.getAttribute("data-film-time") === tt.toFixed(3), t);
    await page.screenshot({ path: path.join(dir, `${String(i).padStart(4, "0")}.png`), type: "png", animations: "disabled" });
    if (i % 48 === 0) log(`${name}: frame ${i}/${FRAMES} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  // Poster: the candle close-up.
  await page.evaluate(([tt, a]) => window.__setFilmTime(tt, a), [13.2, aspect]);
  await page.waitForTimeout(100);
  const posterPng = path.join(dir, "poster.png");
  await page.screenshot({ path: posterPng, type: "png" });
  await page.close();
  return { dir, posterPng };
}

async function main() {
  log(`starting next dev on :${PORT}`);
  const dev = spawn("npx", ["next", "dev", "-p", String(PORT)], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, BROWSER: "none" } });
  dev.stdout.on("data", (d) => process.env.VERBOSE && process.stdout.write(d));
  dev.stderr.on("data", (d) => process.env.VERBOSE && process.stderr.write(d));
  try {
    await waitFor(BASE);
    const browser = await chromium.launch();

    // Soundtrack (once).
    const page = await browser.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__filmReady === true, null, { timeout: 120000 });
    log("rendering soundtrack offline (OfflineAudioContext)");
    const wavB64 = await page.evaluate((s) => window.__renderSoundtrack(s), DURATION);
    const wavPath = path.join(OUT_MUSIC, "pineapple-waltz-hop.wav");
    fs.writeFileSync(wavPath, Buffer.from(wavB64, "base64"));
    log(`soundtrack → ${path.relative(ROOT, wavPath)} (${(fs.statSync(wavPath).size / 1e6).toFixed(1)} MB)`);
    await page.close();

    const jobs = [
      { name: "landscape", width: 1920, height: 1080, aspect: "landscape", out: "birthday-film-landscape.mp4" },
      { name: "portrait", width: 1080, height: 1920, aspect: "portrait", out: "birthday-film-portrait.mp4" },
    ];
    for (const job of jobs) {
      const { dir, posterPng } = await renderOrientation(browser, job);
      const outPath = path.join(OUT_FILM, job.out);
      log(`${job.name}: encoding with ffmpeg → ${path.relative(ROOT, outPath)}`);
      execFileSync(
        "ffmpeg",
        ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(dir, "%04d.png"), "-i", wavPath, "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "160k", "-shortest", outPath],
        { stdio: "inherit" },
      );
      if (job.name === "landscape") {
        const poster = path.join(OUT_FILM, "birthday-film-poster.webp");
        execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", posterPng, "-vf", "scale=1280:-1", "-quality", "82", poster], { stdio: "inherit" });
        log(`poster → ${path.relative(ROOT, poster)}`);
      }
      log(`${job.name}: ${(fs.statSync(outPath).size / 1e6).toFixed(1)} MB`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
    await browser.close();
    log("done. Verify in the browser: Scene 2 should now show the label “Original animated film”.");
  } finally {
    dev.kill("SIGTERM");
    fs.rmSync(WORK, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
