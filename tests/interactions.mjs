/**
 * Browser walkthrough of the whole experience using the pre-installed Playwright + Chromium.
 * Run with the production server up on :3000 (`npm run build && npm start`), then `npm run test:e2e`.
 * It asserts the critical interactions and drops screenshots in docs/screenshots/.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// Playwright + Chromium are pre-installed globally in this environment (resolved via NODE_PATH).
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.resolve("docs/screenshots");
fs.mkdirSync(OUT, { recursive: true });

let failures = 0;
const check = (cond, msg) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else {
    failures++;
    console.log(`  ✗ ${msg}`);
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readEnvLocal(key) {
  try {
    const line = fs.readFileSync(path.resolve(".env.local"), "utf8").split("\n").find((l) => l.startsWith(`${key}=`));
    return line ? line.slice(key.length + 1).trim() : "";
  } catch {
    return "";
  }
}

/** Computes the expected age the same way the app does, so the test is date-independent. */
function expectedAge(now = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "numeric", day: "numeric" });
  const p = Object.fromEntries(fmt.formatToParts(now).filter((x) => x.type !== "literal").map((x) => [x.type, +x.value]));
  let age = p.year - 1999;
  if (p.month < 2 || (p.month === 2 && p.day < 4)) age--;
  return age;
}

async function walkthrough({ name, viewport, reducedMotion = "no-preference", isMobile = false }) {
  console.log(`\n▶ ${name} (${viewport.width}×${viewport.height}, reduced-motion: ${reducedMotion})`);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport, isMobile, hasTouch: isMobile, reducedMotion, acceptDownloads: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    // HEAD probes for optional media (film MP4/poster, voice note) 404 by design when assets are missing.
    // The deliberate wrong-password attempt logs a 401 resource error; that is expected.
    if (m.type() === "error" && !/404|401/.test(m.text())) errors.push(`console: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() === 404 && !/\/(film|music|voice)\//.test(r.url())) errors.push(`unexpected 404: ${r.url()}`);
  });
  const shot = (file) => page.screenshot({ path: path.join(OUT, `${name}-${file}.png`) });
  const fast = reducedMotion === "reduce";

  // ── Password gate (only when BIRTHDAY_PASSWORD is configured) ──
  await page.goto(BASE, { waitUntil: "networkidle" });
  if ((await page.getByTestId("gate-password").count()) === 1) {
    const pw = process.env.BIRTHDAY_PASSWORD || readEnvLocal("BIRTHDAY_PASSWORD");
    check(!!pw, "password available to the test (BIRTHDAY_PASSWORD or .env.local)");
    await page.getByTestId("gate-password").fill("definitely-wrong");
    await page.getByTestId("gate-submit").click();
    await page.getByText("That’s not it. Try again.").waitFor({ timeout: 8000 });
    check(true, "wrong password is rejected");
    await page.getByTestId("gate-password").fill(pw || "");
    await page.getByTestId("gate-submit").click();
    await page.getByTestId("cta-celebrate").waitFor({ timeout: 15000 });
    check(true, "correct password opens the experience");
    await page.goto(BASE, { waitUntil: "networkidle" });
    check((await page.getByTestId("gate-password").count()) === 0, "unlock cookie persists across reloads");
  }

  // ── Scene 1 ──
  await sleep(fast ? 400 : 3500);
  await shot("1-intro");
  const age = await page.getByTestId("age-number").innerText();
  check(Number(age) === expectedAge(), `intro shows the correct age (${age})`);
  check(await page.getByRole("heading", { name: /Happy Birthday, Anshu!/ }).isVisible(), "headline 'Happy Birthday, Anshu!' is visible");
  check(await page.getByText("04 FEBRUARY · A DAY WORTH CELEBRATING", { exact: false }).first().isVisible().catch(() => false) || (await page.locator(".eyebrow").first().isVisible()), "eyebrow copy present");
  check((await page.locator("button.momo").count()) >= 1, "Momo is present and tappable in scene 1");
  await page.locator("button.momo").first().click();
  await page.locator("button", { hasText: "04 · 02 · 1999" }).first().click().catch(() => {});
  const ctaBox = await page.getByTestId("cta-celebrate").boundingBox();
  check(ctaBox && ctaBox.height >= 44 && ctaBox.y + ctaBox.height <= viewport.height, "CTA is ≥44px and inside the viewport");
  check(await page.getByRole("button", { name: "Enable music", exact: true }).isVisible(), "music is opt-in (Enable music control shown)");

  // ── Scene 2 ──
  await page.getByTestId("cta-celebrate").click();
  await sleep(fast ? 500 : 1600);
  check(await page.getByText("01 / 04").isVisible().catch(() => false) === false, "progress indicator moved past 01 / 04");
  check(await page.getByText("02 / 04").isVisible(), "scene 2 is the film (02 / 04)");
  const label = await page.getByTestId("film-source-label").innerText();
  check(/Original animated film|Live-animated storybook/i.test(label), `film source label is honest: "${label}"`);
  check(await page.getByTestId("skip-film").isVisible(), "Skip film is visible immediately");
  check(await page.getByTestId("film-continue").isVisible(), "Continue is available before the film ends");
  await shot("2-film-poster");
  await page.getByTestId("play-film").click();
  await sleep(fast ? 1500 : 6000);
  await shot("2-film-playing");
  check((await page.getByTestId("pause-film").count()) === 1 || (await page.getByTestId("play-film-small").count()) === 1, "film controls render while playing");
  check((await page.locator("button.momo").count()) >= 1, "Momo overlay present in scene 2");
  await page.locator("button.momo").first().click();
  if (!fast) {
    // Let the live film reach the cake cut and celebration for a screenshot.
    await sleep(14000);
    await shot("2-film-cut");
  }
  await page.getByTestId("skip-film").click();
  await sleep(fast ? 500 : 1500);

  // ── Scene 3 ──
  check(await page.getByText("03 / 04").isVisible(), "scene 3 is the Pineappleverse (03 / 04)");
  check(await page.getByTestId("playground-continue").isVisible(), "Continue is available before collecting anything");
  check((await page.getByTestId("surprise-progress").innerText()).includes("0 / 3"), "progress starts at 0 / 3");
  await shot("3-playground");
  for (const id of ["surprise-bush", "surprise-balloon", "surprise-gift"]) {
    const box = await page.getByTestId(id).boundingBox();
    check(box && box.width >= 44 && box.height >= 44, `${id} hit target ≥ 44px (${Math.round(box?.width)}×${Math.round(box?.height)})`);
  }
  await page.locator("button.momo").first().click();
  await page.getByTestId("surprise-bush").click();
  await sleep(fast ? 300 : 900);
  await page.getByTestId("surprise-bush").click(); // double tap must not double-collect
  check((await page.getByTestId("surprise-progress").innerText()).includes("1 / 3"), "singing pineapple collected once (1 / 3)");
  await page.getByTestId("surprise-balloon").click();
  await sleep(fast ? 600 : 3400);
  check((await page.getByTestId("surprise-progress").innerText()).includes("2 / 3"), "balloon surprise collected (2 / 3)");
  await page.getByTestId("surprise-gift").click();
  await sleep(fast ? 300 : 1000);
  check(await page.getByTestId("gift-message").isVisible(), "gift message shows 'extra cake' copy");
  check((await page.getByTestId("gift-message").innerText()).includes("The best surprises come with extra cake!"), "gift copy matches the brief");
  await page.getByRole("button", { name: "Yum, got it" }).click();
  await sleep(fast ? 700 : 1200);
  check((await page.getByTestId("surprise-progress").innerText()).includes("3 / 3"), "all three surprises found (3 / 3)");
  check(await page.getByTestId("level-complete").isVisible(), "level complete card appears");
  await shot("3-playground-complete");
  // Keyboard path: focus + Enter on a surprise button works (re-tap is harmless).
  await page.getByTestId("surprise-gift").focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Yum, got it" }).click().catch(() => {});
  // Progress persists across Back → forward
  await page.getByRole("button", { name: /Back to the previous scene/ }).click();
  await sleep(fast ? 500 : 1500);
  await page.getByTestId("film-continue").click();
  await sleep(fast ? 500 : 1500);
  check((await page.getByTestId("surprise-progress").innerText()).includes("3 / 3"), "progress preserved after going back and forward");
  await page.getByTestId("make-a-wish").click();
  await sleep(fast ? 500 : 1500);

  // ── Scene 4 ──
  check(await page.getByText("04 / 04").isVisible(), "scene 4 is the finale (04 / 04)");
  check(await page.getByText("One more birthday wish…").isVisible(), "finale heading present");
  await shot("4-finale-candles");
  for (let i = 0; i < 3; i++) {
    const box = await page.getByTestId(`candle-${i}`).boundingBox();
    check(box && box.width >= 44 && box.height >= 44, `candle ${i + 1} hit target ≥ 44px`);
  }
  await page.getByTestId("candle-0").click();
  await page.getByTestId("candle-2").click();
  check((await page.getByTestId("greeting-card").count()) === 0, "card is not shown before all candles are out");
  await page.getByTestId("candle-1").click();
  await sleep(fast ? 800 : 2800);
  check(await page.getByTestId("greeting-card").isVisible(), "greeting card appears after the third candle");
  check((await page.getByTestId("greeting-card").innerText()).includes("Happy Birthday, Pineapple!"), "greeting copy is the approved default");
  check((await page.getByTestId("voice-greeting").count()) === 0, "voice player hidden when no recording is supplied");
  await shot("4-finale-fireworks");
  const [download] = await Promise.all([page.waitForEvent("download", { timeout: 8000 }).catch(() => null), page.getByTestId("save-card").click()]);
  check(!!download && download.suggestedFilename().endsWith(".png"), "Save a Birthday Card downloads a PNG");
  if (download && name === "mobile") await download.saveAs(path.join(OUT, "birthday-card-export.png"));
  await page.getByTestId("relight").click();
  await sleep(900);
  check((await page.getByTestId("greeting-card").count()) === 0, "relighting candles hides the card");
  await page.getByTestId("blow-all").click();
  await sleep(fast ? 800 : 2500);
  check(await page.getByTestId("greeting-card").isVisible(), "'Blow all candles' shortcut also finishes the wish");
  await page.getByTestId("watch-again").click();
  await sleep(fast ? 500 : 1500);
  check(await page.getByText("02 / 04").isVisible(), "'Watch the Birthday Movie Again' returns to the film");
  await page.getByRole("button", { name: /Home/ }).click();
  await sleep(fast ? 500 : 1500);
  check(await page.getByText("01 / 04").isVisible(), "Home returns to the intro");

  // Replay from the finale resets the run
  await page.getByTestId("cta-celebrate").click();
  await sleep(fast ? 500 : 1500);
  await page.getByTestId("film-continue").click();
  await sleep(fast ? 500 : 1500);
  await page.getByTestId("playground-continue").click();
  await sleep(fast ? 500 : 1500);
  check(await page.getByTestId("greeting-card").isVisible(), "returning to the finale keeps the wish state (card still up)");
  await page.getByTestId("replay-adventure").click();
  await sleep(fast ? 500 : 1800);
  check(await page.getByText("01 / 04").isVisible(), "Replay the Adventure returns to the intro");

  check(errors.length === 0, `no console/page errors (${errors.length})`);
  if (errors.length) console.log(errors.slice(0, 5).map((e) => `    ${e}`).join("\n"));
  await browser.close();
}

await walkthrough({ name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true });
await walkthrough({ name: "mobile-small", viewport: { width: 360, height: 800 }, isMobile: true, reducedMotion: "reduce" });
await walkthrough({ name: "desktop", viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
