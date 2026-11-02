import { describe, expect, it } from "vitest";
import { ALL_COLLECTIBLES, allCandlesOut, allSurprisesFound, initialState, reducer, transitionFor, type ExperienceState } from "@/lib/sceneMachine";

const run = (actions: Parameters<typeof reducer>[1][], start: ExperienceState = initialState) => actions.reduce(reducer, start);

describe("scene order", () => {
  it("walks intro → film → playground → finale and no further", () => {
    let s = initialState;
    expect(s.scene).toBe("intro");
    s = reducer(s, { type: "NEXT" });
    expect(s.scene).toBe("film");
    s = reducer(s, { type: "NEXT" });
    expect(s.scene).toBe("playground");
    s = reducer(s, { type: "NEXT" });
    expect(s.scene).toBe("finale");
    expect(reducer(s, { type: "NEXT" }).scene).toBe("finale");
  });
  it("Back and Home work from later scenes; Back is a no-op on the intro", () => {
    const atFinale = run([{ type: "GO_TO", scene: "finale" }]);
    expect(reducer(atFinale, { type: "BACK" }).scene).toBe("playground");
    expect(reducer(atFinale, { type: "HOME" }).scene).toBe("intro");
    expect(reducer(initialState, { type: "BACK" })).toBe(initialState);
  });
  it("records the choreographed transition for each hop", () => {
    expect(transitionFor("intro", "film")).toBe("sparkles");
    expect(transitionFor("film", "playground")).toBe("pineapple-portal");
    expect(transitionFor("playground", "finale")).toBe("gold-light");
    expect(transitionFor("finale", "intro")).toBe("firework-wipe");
    expect(reducer(initialState, { type: "NEXT" }).transition).toBe("sparkles");
  });
  it("resets film status to idle when leaving the film scene", () => {
    const s = run([{ type: "NEXT" }, { type: "FILM_STATUS", status: "playing" }, { type: "NEXT" }]);
    expect(s.filmStatus).toBe("idle");
  });
});

describe("music preference", () => {
  it("starts muted and toggles", () => {
    expect(initialState.musicEnabled).toBe(false);
    expect(reducer(initialState, { type: "TOGGLE_MUSIC" }).musicEnabled).toBe(true);
    expect(reducer(initialState, { type: "SET_MUSIC", enabled: false })).toBe(initialState);
  });
  it("survives Replay the Adventure", () => {
    const s = run([{ type: "SET_MUSIC", enabled: true }, { type: "GO_TO", scene: "finale" }, { type: "REPLAY_ADVENTURE" }]);
    expect(s.scene).toBe("intro");
    expect(s.musicEnabled).toBe(true);
    expect(s.collected).toEqual([]);
    expect(s.candlesOut).toEqual([false, false, false]);
    expect(s.runId).toBe(1);
  });
});

describe("Pineappleverse collectibles", () => {
  it("collects each surprise exactly once (no double-collection on repeated taps)", () => {
    let s = reducer(initialState, { type: "COLLECT", item: "gift" });
    expect(s.collected).toEqual(["gift"]);
    const again = reducer(s, { type: "COLLECT", item: "gift" });
    expect(again).toBe(s);
    s = run([{ type: "COLLECT", item: "balloon" }, { type: "COLLECT", item: "singing-pineapple" }], s);
    expect(allSurprisesFound(s)).toBe(true);
    expect(s.collected).toHaveLength(ALL_COLLECTIBLES.length);
  });
  it("keeps progress while moving back and forward", () => {
    const s = run([{ type: "GO_TO", scene: "playground" }, { type: "COLLECT", item: "balloon" }, { type: "BACK" }, { type: "NEXT" }]);
    expect(s.scene).toBe("playground");
    expect(s.collected).toEqual(["balloon"]);
  });
});

describe("finale candles", () => {
  it("extinguishes candles individually and triggers fireworks after the third", () => {
    let s = reducer(initialState, { type: "BLOW_CANDLE", index: 1 });
    expect(s.candlesOut).toEqual([false, true, false]);
    expect(s.fireworksTriggered).toBe(false);
    s = reducer(s, { type: "BLOW_CANDLE", index: 1 }); // already out → no change
    expect(s.candlesOut).toEqual([false, true, false]);
    s = run([{ type: "BLOW_CANDLE", index: 0 }, { type: "BLOW_CANDLE", index: 2 }], s);
    expect(allCandlesOut(s)).toBe(true);
    expect(s.fireworksTriggered).toBe(true);
  });
  it("Blow all is a shortcut and relight resets", () => {
    const s = reducer(initialState, { type: "BLOW_ALL" });
    expect(s.candlesOut).toEqual([true, true, true]);
    expect(s.fireworksTriggered).toBe(true);
    const lit = reducer(s, { type: "RELIGHT_CANDLES" });
    expect(lit.candlesOut).toEqual([false, false, false]);
    expect(lit.fireworksTriggered).toBe(false);
  });
});
