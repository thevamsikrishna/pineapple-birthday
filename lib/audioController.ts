"use client";
import { DEFAULT_GAINS, LOOP_SECONDS, scheduleEvent, scoreEvents, type NoteEvent } from "./song";
import { playSfx, type SfxName } from "./sfx";

export type { SfxName };

/**
 * Global audio controller. Everything is created lazily on the first user gesture and stays
 * silent until `setEnabled(true)`. One global mute covers both music and effects.
 */
class AudioController {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private enabled = false;
  private musicTimer: number | null = null;
  private events: NoteEvent[] = scoreEvents(1);
  private nextEventIndex = 0;
  private loopStart = 0;
  private listeners = new Set<(enabled: boolean) => void>();

  get isEnabled() {
    return this.enabled;
  }

  subscribe(fn: (enabled: boolean) => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn(this.enabled));
  }

  /** Must be called from a user gesture handler. Safe to call repeatedly. */
  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    const musicBus = ctx.createGain();
    musicBus.gain.value = 1;
    musicBus.connect(master);
    const sfxBus = ctx.createGain();
    sfxBus.gain.value = 1;
    sfxBus.connect(master);
    this.ctx = ctx;
    this.master = master;
    this.musicBus = musicBus;
    this.sfxBus = sfxBus;
    return ctx;
  }

  async setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.emit();
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (enabled) {
      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch {
          /* ignore */
        }
      }
      if (!this.held) this.startMusic();
    } else {
      this.stopMusic();
      if (ctx.state === "running") {
        try {
          await ctx.suspend();
        } catch {
          /* ignore */
        }
      }
    }
  }

  toggle() {
    return this.setEnabled(!this.enabled);
  }

  private held = false;

  /** Pauses the synth soundtrack while another source (e.g. the film's own audio) plays. */
  holdMusic(hold: boolean) {
    if (hold === this.held) return;
    this.held = hold;
    if (hold) this.stopMusic();
    else if (this.enabled) this.startMusic();
  }

  private startMusic() {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus || this.musicTimer !== null) return;
    this.loopStart = ctx.currentTime + 0.15;
    this.nextEventIndex = 0;
    // Fade in gently.
    this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
    this.musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.musicBus.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.2);
    const LOOKAHEAD = 0.35;
    const tick = () => {
      if (!this.ctx || !this.musicBus) return;
      const now = this.ctx.currentTime;
      while (true) {
        const e = this.events[this.nextEventIndex];
        const at = this.loopStart + e.time;
        if (at > now + LOOKAHEAD) break;
        if (at >= now - 0.05) scheduleEvent(this.ctx, this.musicBus, e, at, DEFAULT_GAINS);
        this.nextEventIndex++;
        if (this.nextEventIndex >= this.events.length) {
          this.nextEventIndex = 0;
          this.loopStart += LOOP_SECONDS;
        }
      }
    };
    tick();
    this.musicTimer = window.setInterval(tick, 100);
  }

  private stopMusic() {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.ctx && this.musicBus) {
      this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, this.ctx.currentTime);
      this.musicBus.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
    }
  }

  /** Briefly dips the soundtrack under a sound effect. */
  private duck(seconds = 0.6, depth = 0.45) {
    if (!this.ctx || !this.musicBus || this.musicTimer === null) return;
    const t = this.ctx.currentTime;
    const g = this.musicBus.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(depth, t + 0.05);
    g.linearRampToValueAtTime(1, t + seconds);
  }

  /** Plays a quiet, whimsical synthesized effect. No-op while muted. */
  sfx(name: SfxName) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    const bus = this.sfxBus;
    if (!ctx || !bus) return;
    const { duck } = playSfx(ctx, bus, name, ctx.currentTime + 0.01);
    if (duck) this.duck(duck);
  }
}

export const audio = new AudioController();
