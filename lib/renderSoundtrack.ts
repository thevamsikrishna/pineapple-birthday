"use client";
/**
 * Renders the film soundtrack offline: the original tune plus timed effects that match
 * FilmStage's choreography (strawberry boing, the cake-cut chime, cheers, the portal whoosh).
 * Returns a 16-bit stereo WAV so scripts/render-film.mjs can mux it into the MP4 with ffmpeg.
 */
import { DEFAULT_GAINS, resetNoiseCache, scheduleSong } from "./song";
import { playSfx, type SfxName } from "./sfx";

export const FILM_CUES: { at: number; sfx: SfxName }[] = [
  { at: 1.0, sfx: "sparkle" },
  { at: 9.7, sfx: "boing" },
  { at: 10.5, sfx: "pop" },
  { at: 13.0, sfx: "sparkle" },
  { at: 19.2, sfx: "chime" },
  { at: 21.0, sfx: "cheer" },
  { at: 23.0, sfx: "tada" },
  { at: 26.2, sfx: "whoosh" },
  { at: 27.3, sfx: "portal" },
];

export async function renderSoundtrack(seconds: number, sampleRate = 48000): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * sampleRate), sampleRate);
  resetNoiseCache();
  const master = ctx.createGain();
  master.gain.value = 1.9; // ≈ +6.5 dB; peaks stay under 0 dBFS (measured max −9.9 dB at 0.9)
  master.connect(ctx.destination);
  const music = ctx.createGain();
  music.connect(master);
  // Gentle fade in / out so the loop edit is invisible.
  music.gain.setValueAtTime(0.0001, 0);
  music.gain.exponentialRampToValueAtTime(1, 1.2);
  music.gain.setValueAtTime(1, seconds - 1.5);
  music.gain.linearRampToValueAtTime(0.0001, seconds - 0.05);
  scheduleSong(ctx, music, 0.1, seconds, DEFAULT_GAINS);
  const sfx = ctx.createGain();
  sfx.gain.value = 0.9;
  sfx.connect(master);
  for (const cue of FILM_CUES) {
    const { duck } = playSfx(ctx, sfx, cue.sfx, cue.at);
    if (duck) {
      music.gain.setValueAtTime(1, cue.at);
      music.gain.linearRampToValueAtTime(0.45, cue.at + 0.05);
      music.gain.linearRampToValueAtTime(1, cue.at + duck);
    }
  }
  return ctx.startRendering();
}

export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const channels = buffer.numberOfChannels;
  const length = buffer.length * channels * 2;
  const out = new ArrayBuffer(44 + length);
  const view = new DataView(out);
  const write = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + length, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, length, true);
  let offset = 44;
  const data = Array.from({ length: channels }, (_, c) => buffer.getChannelData(c));
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < channels; c++) {
      const s = Math.max(-1, Math.min(1, data[c][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return out;
}

export function bytesToBase64(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < arr.length; i += chunk) binary += String.fromCharCode(...arr.subarray(i, i + chunk));
  return btoa(binary);
}
