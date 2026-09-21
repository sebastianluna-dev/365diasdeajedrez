// Synthesises the two board sounds, public/sounds/move.wav and capture.wav.
//
//   npm run sounds:make
//
// They used to be lichess's "standard" move and capture, which lila's
// COPYING.md lists among its non-free exceptions, so they could not stay in a
// repository of ours. These are ours: a short filtered noise burst with a faint
// tone underneath (a piece set down on wood) and a lower, longer one for a
// capture. Deterministic — the noise comes from a seeded generator — so running
// the script twice writes the same bytes. Plain WAV: small enough (a few KB)
// and every browser plays it.

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const SAMPLE_RATE = 44_100;
const OUT_DIR = join(process.cwd(), "public", "sounds");

/** xorshift32: a repeatable noise source, no dependency. */
function noiseSource(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff - 0.5;
  };
}

interface SoundSpec {
  /** Length in seconds. */
  duration: number;
  /** One-pole low-pass cutoff of the noise, in Hz: lower is duller. */
  cutoffHz: number;
  /** How fast the burst dies: bigger is shorter. */
  decayPerSecond: number;
  /** Frequency and level of the tone under the noise. */
  toneHz: number;
  toneLevel: number;
  noiseLevel: number;
  seed: number;
}

const SPECS: Record<"move" | "capture", SoundSpec> = {
  move: {
    duration: 0.07,
    cutoffHz: 2400,
    decayPerSecond: 70,
    toneHz: 880,
    toneLevel: 0.12,
    noiseLevel: 0.55,
    seed: 365,
  },
  capture: {
    duration: 0.13,
    cutoffHz: 900,
    decayPerSecond: 34,
    toneHz: 160,
    toneLevel: 0.32,
    noiseLevel: 0.7,
    seed: 1985,
  },
};

function synthesise(spec: SoundSpec): Int16Array {
  const length = Math.round(spec.duration * SAMPLE_RATE);
  const samples = new Int16Array(length);
  const noise = noiseSource(spec.seed);
  // Low-pass coefficient for a one-pole filter at the cutoff.
  const alpha = 1 - Math.exp((-2 * Math.PI * spec.cutoffHz) / SAMPLE_RATE);
  let filtered = 0;
  const attack = Math.round(0.002 * SAMPLE_RATE);

  for (let index = 0; index < length; index++) {
    const t = index / SAMPLE_RATE;
    filtered += alpha * (noise() - filtered);
    const envelope = Math.exp(-spec.decayPerSecond * t) * (index < attack ? index / attack : 1);
    const tone = Math.sin(2 * Math.PI * spec.toneHz * t) * Math.exp(-spec.decayPerSecond * 1.4 * t);
    const value = (filtered * spec.noiseLevel + tone * spec.toneLevel) * envelope;
    samples[index] = Math.max(-1, Math.min(1, value)) * 0x7fff;
  }
  return samples;
}

/** 16-bit mono PCM WAV. */
function wav(samples: Int16Array): Buffer {
  const dataBytes = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);
  for (let index = 0; index < samples.length; index++) buffer.writeInt16LE(samples[index] ?? 0, 44 + index * 2);
  return buffer;
}

for (const [name, spec] of Object.entries(SPECS)) {
  const file = join(OUT_DIR, `${name}.wav`);
  writeFileSync(file, wav(synthesise(spec)));
  console.log(`✔ ${file}`);
}
