# Operation: Pineapple Birthday 🍍

A cinematic, mobile-first, four-scene interactive birthday adventure for Anshu ("Pineapple"), starring **Momo the monkey**. Built with Next.js 16, React 19, TypeScript, Tailwind 4, Motion, hand-built SVG illustration, Canvas particles and Web Audio.

```
01  Starry birthday intro      → "Let's celebrate"
02  The birthday film          → play / skip / continue   (girl cuts the cake, animals celebrate, Momo's strawberry gag)
03  Pineappleverse playground  → find 3 surprises         (singing pineapple · mischievous balloon · mystery gift)
04  Make a wish finale         → blow 3 candles           (fireworks, confetti mishap, greeting card)
```

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start      # production
npm test                        # unit tests (age logic, scene machine, score)
npm run test:e2e                # Playwright walkthrough against :3000 (writes docs/screenshots/)
npm run render:film             # re-render the film MP4s + poster + soundtrack (needs ffmpeg)
npm run lint && npm run typecheck
```

## What is where

| Path | Purpose |
|---|---|
| `components/BirthdayExperience.tsx` | SPA shell: state machine, scene transitions, global audio sync |
| `components/SceneShell.tsx` | Home / Back, `01 / 04` progress, mute toggle |
| `components/MomoMascot.tsx` | The one canonical mascot (layered SVG, 12 CSS clips, tap-to-react, hat token) |
| `components/scenes/*` | The four scenes |
| `components/film/FilmStage.tsx` | Time-driven 7-shot film (`t` in → exact frame out) |
| `components/film/Cast.tsx` | Girl, bunny, deer, kitten, birds, squirrel, cake, props, posable Momo |
| `components/effects/*` | Starfield, fireflies, confetti, fireworks, scene-transition wipes |
| `lib/birthdayAge.ts` | Age / countdown in `Asia/Kolkata` (28 on 2027‑02‑04) |
| `lib/sceneMachine.ts` | Pure reducer: scenes, music, film status, collectibles, candles |
| `lib/song.ts`, `lib/sfx.ts`, `lib/audioController.ts` | Original tune + effects, synthesized with Web Audio, opt-in only |
| `lib/assets.ts` | Single asset registry with honest fallbacks |
| `lib/exportCard.ts` | Client-side "Save a Birthday Card" PNG export |
| `app/film-render/` | Dev-only render harness used by `scripts/render-film.mjs` (not a scene, never linked) |
| `docs/asset-manifest.md`, `docs/storyboard.md` | Asset status and the shot list |
| `tests/` | Vitest unit tests + Playwright walkthrough |

## Design system

Tokens live in `app/globals.css`: midnight indigo `#16152E`, lavender `#BBA9F7`, cream `#FFF5DF`, honey `#F8C86A`, pineapple `#FFD75E`, candy pink `#F5A8CE`, mint `#8FD2AF`, plum `#29223D`. Display type is Fraunces, UI type is Nunito Sans, both with system fallbacks. Motion is soft and bounded; `prefers-reduced-motion` collapses transitions to quick fades and stops idle loops.

## Behaviour guarantees

- Exactly four scenes, no page reloads, Back / Home from scenes 2–4, `Skip film` and `Continue` always available.
- Sound is **off by default**. One global toggle covers music and effects. The film's own soundtrack is used when the MP4 plays and the live synth is paused meanwhile.
- The MP4 is probed with a HEAD request; if it is missing or fails, the live-animated storybook plays instead and the frame is labelled accordingly.
- Progress (surprises found, candles out, music preference) persists across Back / Forward in the same visit. `Replay the Adventure` resets the run but keeps the music preference.
- Hit targets ≥ 44 px, keyboard-focusable controls with visible focus, live regions for progress.
- No analytics, cookies, forms, logins, tracking pixels or outbound requests besides Google Fonts.
- The voice-message control only renders when a real recording is registered in `lib/assets.ts`.

## Password door and visit tracking

**Password.** The site is locked behind a password door (Momo asks for "the secret word"). The password is never stored in the repo:

- Locally: create `.env.local` with `BIRTHDAY_PASSWORD=…` (see `.env.example`). Without it, `npm run dev` opens directly; a production build stays locked and tells you the password is not configured.
- On Vercel: Project → Settings → Environment Variables → add `BIRTHDAY_PASSWORD`, then redeploy.
- A correct password sets an HttpOnly cookie for 30 days. Changing the password logs everyone out.

**Tracking.** Once unlocked, the page sends small events to `/api/track`: scene opened (with seconds since arrival), scene left (seconds spent), film played / finished / skipped, surprises found, candles out, card saved, and a final "visit ended" with the total time and last scene. No IP addresses or fingerprints are kept; each visit gets a random id so two visits can be told apart, plus a coarse device label (iPhone / Android / Mac / Windows) and the country Vercel reports.

Where to read it:

1. **Vercel logs (zero setup).** Project → Logs, filter for `pineapple-track`. Each event is one JSON line.
2. **Discord notifications (recommended, free, permanent).** In any Discord server: channel settings → Integrations → Webhooks → New webhook → Copy URL. Add it on Vercel as `TRACK_WEBHOOK_URL` and redeploy. Every event then arrives as a readable message, for example "👀 [a1b2c3 · iPhone · IN] opened scene 2 · Birthday film after 41s" and "⏱️ left scene 2 after 33s on it".
3. **Your own webhook.** Set `TRACK_WEBHOOK_FORMAT=json` to receive the raw events at any URL instead.

Keep your own visits out of the feed by opening the site once with `?owner=1` on each of your devices (it is remembered in that browser; `?owner=0` undoes it). Set `TRACKING=off` to switch tracking off completely.

## Deployment

Static-friendly Next.js app. On Vercel: import the repo, framework preset "Next.js", no environment variables needed. Anywhere else: `npm run build && npm start` behind any Node host, or `next build` output served by a Node process. Keep `public/film/*.mp4` in the deploy (≈ a few MB each).

Build privately first; share the link only through a channel that is welcome.

## Honest status

See the end of `docs/asset-manifest.md` for what is generated, included, and intentionally absent (the voice note).
