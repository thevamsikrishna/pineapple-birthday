import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FILM_DURATION, FilmStage, SHOTS, cameraAt, shotAt } from "@/components/film/FilmStage";

describe("film storyboard", () => {
  it("has seven contiguous shots covering 0–28 s", () => {
    expect(SHOTS).toHaveLength(7);
    expect(SHOTS[0].start).toBe(0);
    expect(SHOTS[SHOTS.length - 1].end).toBe(FILM_DURATION);
    for (let i = 1; i < SHOTS.length; i++) expect(SHOTS[i].start).toBe(SHOTS[i - 1].end);
    expect(shotAt(19.5).title).toBe("The first slice");
    expect(shotAt(9).caption).toMatch(/strawberry/);
    expect(shotAt(99).title).toBe("Momo, wait!");
  });

  it("keeps the camera inside the world and glides within each shot", () => {
    for (let t = 0; t <= FILM_DURATION; t += 0.25) {
      const c = cameraAt(t);
      expect(c.s).toBeGreaterThan(0.8);
      expect(c.s).toBeLessThan(2.6);
      expect(c.cx).toBeGreaterThan(600);
      expect(c.cx).toBeLessThan(1000);
      if (t > 0 && shotAt(t).start !== t) {
        const prev = cameraAt(t - 0.25);
        expect(Math.abs(c.s - prev.s)).toBeLessThan(0.05); // no jump cuts inside a shot
      }
    }
  });

  it("renders the cake intact before the cut and separated after it", () => {
    const before = renderToStaticMarkup(<FilmStage t={18.5} />);
    const after = renderToStaticMarkup(<FilmStage t={20.6} />);
    // The exposed cross-section layers only exist once the slice has moved.
    expect(before).not.toContain('fill="#FFE9C9"');
    expect(after).toContain('fill="#FFE9C9"');
    // Knife present from shot 4 onwards, absent in the opening.
    expect(renderToStaticMarkup(<FilmStage t={2} />)).not.toContain("#E8EEF5");
    expect(after).toContain("#E8EEF5");
  });

  it("is deterministic for a given time (same frame twice)", () => {
    expect(renderToStaticMarkup(<FilmStage t={10.3} />)).toBe(renderToStaticMarkup(<FilmStage t={10.3} />));
  });

  it("supports a portrait crop that keeps the cake centred", () => {
    const portrait = renderToStaticMarkup(<FilmStage t={19} aspect="portrait" />);
    expect(portrait).toContain('viewBox="462 0 676 900"');
    expect(portrait).toContain("the first slice");
  });
});
