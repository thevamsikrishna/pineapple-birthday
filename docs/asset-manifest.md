# Asset manifest

Every external media file the experience can use is registered in **`lib/assets.ts`**. A `null` path means "not supplied", and the UI shows its honest fallback. Nothing is loaded from third-party services; everything lives under `public/`.

| Asset | Path | Status | Produced by | Fallback when missing |
|---|---|---|---|---|
| Birthday film, landscape | `public/film/birthday-film-landscape.mp4` (1920×1080, H.264 + AAC, 24 fps, 28 s) | **Generated** by `npm run render:film` | Playwright frame capture of `components/film/FilmStage.tsx` + ffmpeg | Live-animated storybook rendered in the browser (same choreography), labelled "Live-animated storybook" |
| Birthday film, portrait | `public/film/birthday-film-portrait.mp4` (1080×1920) | **Generated** | same | Landscape MP4, then the live storybook |
| Film poster | `public/film/birthday-film-poster.webp` | **Generated** (candle close-up, t = 13.2 s) | ffmpeg from a captured frame | The live storybook's frame at t = 2.5 s |
| Film captions | `public/film/birthday-film-captions.vtt` | **Included** (descriptive captions; no spoken lines) | hand-written | none needed |
| Film soundtrack | `public/music/pineapple-waltz-hop.wav` (48 kHz stereo, 28 s) | **Generated** (original composition, see `lib/song.ts`) | `OfflineAudioContext` render of the synth score + timed effects | Muxed into the MP4s; the live storybook uses the same synth in real time |
| Background music loop | `assets.music.backgroundLoop` → `null` | Not supplied (optional) | — | The original tune is synthesized live with Web Audio (no file needed) |
| Sound effects | synthesized in `lib/sfx.ts` | **Included** | Web Audio | silent when muted (default) |
| Momo mascot | `components/MomoMascot.tsx` + `MomoArt` in `components/film/Cast.tsx` | **Included** (one canonical layered SVG, 12 CSS clips) | hand-built | — |
| Girl, bunny, deer, kitten, birds, squirrel, cake, props | `components/film/Cast.tsx` | **Included** (original stylized SVG, one visual grammar) | hand-built | — |
| Pineappleverse world | `components/scenes/PineappleverseScene.tsx` | **Included** (SVG diorama, no emoji) | hand-built | — |
| Fireworks / confetti | `components/effects/Fireworks.tsx`, `Confetti.tsx` | **Included** (Canvas 2D, capped particle counts, auto-stop) | hand-built | reduced-motion variant |
| Voice greeting | `assets.voice.greeting` → `null` | **Not supplied** | must be a real recording by the creator | The "Play a tiny birthday message" control is hidden entirely. The app never synthesizes a voice. |
| Favicon | `public/icons/pineapple.svg` | **Included** | hand-built | — |

## Regenerating the film

```bash
npm run render:film
```

The script starts `next dev` on port 3100, drives `/film-render` (a development-only harness that is **not** one of the four scenes and is never linked), captures 672 frames per orientation, renders the soundtrack offline in the browser, and encodes with ffmpeg. Requirements: Node 18+, ffmpeg with `libx264`, `aac` and `libwebp`, and a Playwright Chromium (`npx playwright install chromium` if it is not already installed). Set `FPS=12` for a quick preview render.

If you later replace the film with externally produced footage, keep the same file names (or update `lib/assets.ts`) and keep the storyboard timing in `docs/storyboard.md` so the in-app captions and sound cues still line up.

## Adding the voice greeting

1. Record a 10–20 second message yourself (never generate or clone a voice).
2. Save it as `public/voice/birthday-message.m4a` (or `.mp3`).
3. In `lib/assets.ts` set `voice.greeting` to `"/voice/birthday-message.m4a"` and update `voice.transcript` to match the recording.
4. The control appears on the final card after the candles are out. It never autoplays.

## Licensing

- The tune "Pineapple Waltz-Hop" is composed for this project as note data in `lib/song.ts` and rendered by code. No commercial recordings are used anywhere.
- All artwork is original vector illustration created in this repository.
- Fonts: Fraunces and Nunito Sans via Google Fonts (SIL Open Font License), with system fallbacks if the network blocks them.
