/**
 * Whimsical synthesized sound effects. Context-agnostic so they can be played live
 * (AudioContext) or baked into the film soundtrack (OfflineAudioContext).
 */
import { BEAT, midiToHz, noiseBuffer, playBell, playClap, playPluck } from "./song";

export type SfxName = "sparkle" | "pop" | "boing" | "whoosh" | "puff" | "chime" | "tada" | "pluck" | "cheer" | "firework" | "portal";

export function playSfx(ctx: BaseAudioContext, bus: AudioNode, name: SfxName, t: number, gain = 1): { duck?: number } {
  switch (name) {
    case "sparkle":
      [88, 92, 95, 100].forEach((m, i) => playBell(ctx, bus, midiToHz(m), t + i * 0.06, 0.5, 0.06 * gain));
      return {};
    case "chime":
      [84, 88, 91].forEach((m, i) => playBell(ctx, bus, midiToHz(m), t + i * 0.12, 1.2, 0.09 * gain));
      return { duck: 0.8 };
    case "pluck":
      [72, 76, 79, 84].forEach((m, i) => playPluck(ctx, bus, midiToHz(m), t + i * 0.1, 0.3, 0.16 * gain));
      return { duck: 0.7 };
    case "pop": {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.18 * gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc.connect(g).connect(bus);
      osc.start(t);
      osc.stop(t + 0.16);
      return {};
    }
    case "boing": {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(480, t + 0.18);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.14 * gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.connect(g).connect(bus);
      osc.start(t);
      osc.stop(t + 0.5);
      return {};
    }
    case "whoosh":
    case "portal": {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx);
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = 1.2;
      f.frequency.setValueAtTime(300, t);
      f.frequency.exponentialRampToValueAtTime(name === "portal" ? 2600 : 1800, t + 0.5);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12 * gain, t + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      src.connect(f).connect(g).connect(bus);
      src.start(t);
      src.stop(t + 0.85);
      if (name === "portal") [91, 95, 98].forEach((m, i) => playBell(ctx, bus, midiToHz(m), t + 0.3 + i * 0.08, 0.9, 0.05 * gain));
      return {};
    }
    case "puff": {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx);
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(1200, t);
      f.frequency.exponentialRampToValueAtTime(200, t + 0.25);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.16 * gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      src.connect(f).connect(g).connect(bus);
      src.start(t);
      src.stop(t + 0.32);
      return {};
    }
    case "tada":
      [72, 76, 79, 84, 88].forEach((m, i) => playPluck(ctx, bus, midiToHz(m), t + i * 0.07, 0.4, 0.15 * gain));
      [96, 100].forEach((m, i) => playBell(ctx, bus, midiToHz(m), t + 0.4 + i * 0.1, 1.4, 0.07 * gain));
      return { duck: 1 };
    case "cheer":
      for (let i = 0; i < 6; i++) playClap(ctx, bus, t + i * BEAT * 0.25, 0.08 * gain);
      [79, 84].forEach((m, i) => playBell(ctx, bus, midiToHz(m), t + 0.2 + i * 0.15, 0.8, 0.06 * gain));
      return {};
    case "firework": {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx);
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(2500, t);
      f.frequency.exponentialRampToValueAtTime(120, t + 0.6);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.14 * gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      src.connect(f).connect(g).connect(bus);
      src.start(t);
      src.stop(t + 0.72);
      playBell(ctx, bus, midiToHz(96 + Math.floor(Math.random() * 5)), t + 0.05, 0.6, 0.04 * gain);
      return {};
    }
  }
}
