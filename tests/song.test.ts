import { describe, expect, it } from "vitest";
import { BARS, BEAT, BPM, LOOP_SECONDS, MELODY, midiToHz, scoreEvents } from "@/lib/song";

describe("original soundtrack score", () => {
  it("sits in the brief's 100–120 BPM range", () => {
    expect(BPM).toBeGreaterThanOrEqual(100);
    expect(BPM).toBeLessThanOrEqual(120);
    expect(LOOP_SECONDS).toBeCloseTo(BARS * 4 * BEAT, 6);
  });
  it("has eight full bars of eighth notes", () => {
    expect(MELODY).toHaveLength(8);
    MELODY.forEach((bar) => expect(bar).toHaveLength(8));
  });
  it("expands to a sorted event list and loops seamlessly", () => {
    const one = scoreEvents(1);
    const two = scoreEvents(2);
    expect(two.length).toBe(one.length * 2);
    for (let i = 1; i < two.length; i++) expect(two[i].time).toBeGreaterThanOrEqual(two[i - 1].time);
    expect(two[two.length - 1].time).toBeLessThan(LOOP_SECONDS * 2);
  });
  it("tunes A4 to 440 Hz", () => {
    expect(midiToHz(69)).toBe(440);
    expect(midiToHz(81)).toBeCloseTo(880, 6);
  });
});
