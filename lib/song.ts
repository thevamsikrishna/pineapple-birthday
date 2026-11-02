/**
 * "Pineapple Waltz-Hop" — an original, royalty-free birthday tune composed for this project.
 * It is described as data so the same score can be played live (AudioContext) or rendered
 * offline (OfflineAudioContext) into the film soundtrack.
 *
 * Key: C major · Tempo: 112 BPM · 8-bar loop · instrumentation: pizzicato pluck, glass bells,
 * soft bass, light hand claps. Nothing here is a commercial recording.
 */
export const BPM = 112;
export const BEAT = 60 / BPM; // seconds per beat
export const STEP = BEAT / 2; // eighth note
export const BARS = 8;
export const LOOP_SECONDS = BARS * 4 * BEAT; // ≈ 17.1 s

// MIDI note numbers; 0 = rest. Eight eighth-notes per bar.
export const MELODY: number[][] = [
  [76, 79, 76, 72, 74, 76, 74, 0], // C   — whimsical opening
  [72, 76, 81, 76, 72, 0, 69, 0], // Am
  [77, 81, 77, 72, 69, 72, 74, 76], // F
  [74, 0, 71, 74, 79, 0, 0, 0], // G  — playful monkey accent
  [79, 76, 72, 76, 79, 81, 79, 0], // C
  [76, 72, 69, 72, 76, 0, 81, 0], // Am
  [77, 76, 74, 72, 74, 76, 77, 81], // F  — bright climb
  [79, 0, 74, 0, 76, 0, 72, 0], // G→C — flourish home
];

// Root notes per bar, played on beats 1 and 3.
export const BASS: number[] = [48, 45, 41, 43, 48, 45, 41, 43];

// Bell counter-melody: one sparkle per bar on beat 1 (octave above chord tone).
export const BELLS: number[] = [84, 81, 84, 83, 84, 81, 86, 84];

export const midiToHz = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

export interface SongVoiceGains {
  pluck: number;
  bell: number;
  bass: number;
  clap: number;
}

export const DEFAULT_GAINS: SongVoiceGains = { pluck: 0.22, bell: 0.08, bass: 0.16, clap: 0.05 };

/** A single note event in absolute seconds from `startTime`. */
export interface NoteEvent {
  time: number;
  voice: keyof SongVoiceGains;
  midi: number;
  duration: number;
}

/** Expands the score into a flat, time-sorted event list for `loops` repetitions. */
export function scoreEvents(loops = 1): NoteEvent[] {
  const events: NoteEvent[] = [];
  for (let loop = 0; loop < loops; loop++) {
    const loopOffset = loop * LOOP_SECONDS;
    for (let bar = 0; bar < BARS; bar++) {
      const barStart = loopOffset + bar * 4 * BEAT;
      MELODY[bar].forEach((midi, step) => {
        if (midi) events.push({ time: barStart + step * STEP, voice: "pluck", midi, duration: STEP * 0.9 });
      });
      events.push({ time: barStart, voice: "bass", midi: BASS[bar], duration: BEAT * 1.6 });
      events.push({ time: barStart + 2 * BEAT, voice: "bass", midi: BASS[bar], duration: BEAT * 1.6 });
      events.push({ time: barStart, voice: "bell", midi: BELLS[bar], duration: BEAT * 2.5 });
      // Soft claps on 2 and 4 in the second half of the loop for lift.
      if (bar >= 4) {
        events.push({ time: barStart + BEAT, voice: "clap", midi: 0, duration: 0.08 });
        events.push({ time: barStart + 3 * BEAT, voice: "clap", midi: 0, duration: 0.08 });
      }
    }
  }
  return events.sort((a, b) => a.time - b.time);
}

/* ---------- Synth voices (work on both AudioContext and OfflineAudioContext) ---------- */

export function playPluck(ctx: BaseAudioContext, dest: AudioNode, hz: number, at: number, dur: number, gain: number) {
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = hz;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(hz * 6, at);
  filter.frequency.exponentialRampToValueAtTime(hz * 1.5, at + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(dur, 0.12));
  osc.connect(filter).connect(g).connect(dest);
  osc.start(at);
  osc.stop(at + Math.max(dur, 0.12) + 0.02);
}

export function playBell(ctx: BaseAudioContext, dest: AudioNode, hz: number, at: number, dur: number, gain: number) {
  const partials = [1, 2.76, 5.4];
  const amps = [1, 0.35, 0.12];
  partials.forEach((ratio, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = hz * ratio;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain * amps[i], at + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur / (i + 1));
    osc.connect(g).connect(dest);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  });
}

export function playBass(ctx: BaseAudioContext, dest: AudioNode, hz: number, at: number, dur: number, gain: number) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = hz;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g).connect(dest);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

let noiseBufferCache = new WeakMap<BaseAudioContext, AudioBuffer>();

export function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  const cached = noiseBufferCache.get(ctx);
  if (cached) return cached;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noiseBufferCache.set(ctx, buffer);
  return buffer;
}

export function resetNoiseCache() {
  noiseBufferCache = new WeakMap();
}

export function playClap(ctx: BaseAudioContext, dest: AudioNode, at: number, gain: number) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
  src.connect(filter).connect(g).connect(dest);
  src.start(at);
  src.stop(at + 0.12);
}

export function scheduleEvent(ctx: BaseAudioContext, dest: AudioNode, e: NoteEvent, at: number, gains: SongVoiceGains = DEFAULT_GAINS) {
  switch (e.voice) {
    case "pluck":
      return playPluck(ctx, dest, midiToHz(e.midi), at, e.duration, gains.pluck);
    case "bell":
      return playBell(ctx, dest, midiToHz(e.midi), at, e.duration, gains.bell);
    case "bass":
      return playBass(ctx, dest, midiToHz(e.midi), at, e.duration, gains.bass);
    case "clap":
      return playClap(ctx, dest, at, gains.clap);
  }
}

/** Schedules the whole song for `seconds` into a destination, starting at `startTime`. */
export function scheduleSong(ctx: BaseAudioContext, dest: AudioNode, startTime: number, seconds: number, gains?: SongVoiceGains) {
  const loops = Math.ceil(seconds / LOOP_SECONDS) + 1;
  for (const e of scoreEvents(loops)) {
    if (e.time > seconds) break;
    scheduleEvent(ctx, dest, e, startTime + e.time, gains);
  }
}
