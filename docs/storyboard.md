# The Birthday Film — storyboard (28 s, 7 shots)

Rendered deterministically by `components/film/FilmStage.tsx` from a time value `t`. The same component plays live in the browser and is captured frame-by-frame into the MP4s. Captions are also in `public/film/birthday-film-captions.vtt`.

**World:** a pastel garden at golden hour, 1600×900 units. Camera = `cameraAt(t)`. Portrait cut uses the centre 676 units.

| # | Time | Camera | Action | Sound cue (`lib/renderSoundtrack.ts`) |
|---|---|---|---|---|
| 1 | 0:00–0:04 | Wide, slow push-in (0.84 → 1.0) | The garden wakes: fireflies, string lights. The deer walks in from the left, the kitten pads in from the right, the bunny hops in. Birds cross the sky. The birthday girl starts walking in from frame left. | sparkle at 1.0 s |
| 2 | 0:04–0:08 | Medium on the table (1.45 → 1.58) | The girl arrives behind the cake table, beams at the cake (eyes-closed smile 5.4–7.6 s). The bunny holds up a lavender flower. | — |
| 3 | 0:08–0:12 | Cutaway, right of table (1.85 → 1.95) | Momo tiptoes in (8.1–9.6 s), leans and reaches for the top strawberry (9.6–10.5 s). The bunny turns with a disapproving glare (10.1–11.8 s). Momo freezes, mouth open, and slowly retracts (10.9–11.3 s). | boing 9.7 s · pop 10.5 s |
| 4 | 0:12–0:17 | Close-up on cake (2.1 → 2.3) | Candle sparkles bloom. The girl's expression goes to "focus"; she lifts the knife (arm –8° → –120°, 12.5–14.2 s) and holds it poised. | sparkle 13.0 s |
| 5 | 0:17–0:21 | Tight close-up (2.3 → 2.45) | **The cut:** the arm swings down (–120° → –40°, 17.6–19.0 s) with a slight forward lean; the blade enters the bottom tier; the slice separates and slides out (`cut` 0 → 1, 19.0–20.4 s) revealing the layered cross-section; she lifts the knife clear (19.6–20.6 s). | chime 19.2 s |
| 6 | 0:21–0:25 | Wide celebration (1.02 → 1.12) | The girl throws both arms up. Bunny hops, birds circle the table, the squirrel dances on the lavender tree, Momo claps. 70 pieces of confetti drift down. | cheer 21.0 s · tada 23.0 s |
| 7 | 0:25–0:28 | Wide → Momo flies to lens | A banana balloon drifts down to Momo (25–26 s). He grabs it, rises and grows toward the camera (26.1–27.6 s). A golden pineapple portal expands to fill the frame (27.1–28 s). | whoosh 26.2 s · portal 27.3 s |

**Cast consistency:** every character is drawn in `components/film/Cast.tsx` with the same eye style, blush, rounded silhouettes and pastel gradients. Momo in the film is `MomoArt`, the same geometry as the interactive `MomoMascot` used in all four scenes.

**Continuity notes:** the girl stands behind the table so the blade is hidden by the cake body while it is "inside"; the exposed cross-section and the separated wedge sell the cut without any 3D. The portal colour (pineapple yellow with mint leaves) is picked up by the Film → Pineappleverse scene transition.
