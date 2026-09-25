// Synthesises the two board sounds, public/sounds/move.wav and capture.wav.
//
//   npm run sounds:make
//
// They used to be lichess's "standard" move and capture, which lila's
// COPYING.md lists among its non-free exceptions, so they could not stay in a
// repository of ours. These are ours, and they are made to sound like that
// kind of thing — a piece set down on a wooden board, a harder knock for a
// capture — by modal synthesis: a short burst of filtered noise (the strike)
// over a bank of two-pole resonators (the wood ringing), one per measured
// frequency. Deterministic — the noise comes from a seeded generator — so
// running the script twice writes the same bytes. Plain WAV: small enough (a
// few KB) and every browser plays it.

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

interface Mode {
  /** Resonant frequency in Hz. */
  hz: number;
  /** Relative level of the mode, 1 being the loudest. */
  level: number;
  /** How fast the mode dies, in 1/s: bigger is shorter. */
  decayPerSecond: number;
}

interface SoundSpec {
  /** Length in seconds. */
  duration: number;
  /** The strike: a burst of filtered noise that excites the resonators. */
  burst: {
    /** Length of the burst in seconds. */
    duration: number;
    /** Cutoff of the noise's two-pole low-pass, in Hz: lower is duller. */
    cutoffHz: number;
    /** How much of the raw burst is heard directly, next to the resonances. */
    level: number;
  };
  /** The body: what rings after the strike, one resonator per mode. */
  modes: Mode[];
  /** Peak of the finished sound, 1 being full scale. */
  peak: number;
  seed: number;
}

// The specs were tuned against MEASUREMENTS of lichess's standard recordings
// (spectral peaks, band energy, time to -20/-30/-40 dB): analysis, the way a
// musician matches a timbre by ear. Not one sample of theirs goes in; nothing
// here derives from a file.
//
//   move    a low thump (75 Hz) under wood resonances between 450 and 900 Hz,
//           gone in 40 ms; nothing above 2 kHz.
//   capture a harder strike that rings between 600 and 1900 Hz, with a tail
//           that outlives the move's.
const SPECS: Record<"move" | "capture", SoundSpec> = {
  move: {
    duration: 0.1,
    burst: { duration: 0.006, cutoffHz: 1000, level: 0.35 },
    modes: [
      { hz: 75, level: 0.85, decayPerSecond: 80 },
      { hz: 452, level: 0.35, decayPerSecond: 55 },
      { hz: 517, level: 0.4, decayPerSecond: 55 },
      { hz: 635, level: 0.45, decayPerSecond: 60 },
      { hz: 721, level: 0.32, decayPerSecond: 65 },
      { hz: 904, level: 0.2, decayPerSecond: 75 },
    ],
    peak: 0.95,
    seed: 365,
  },
  capture: {
    duration: 0.2,
    burst: { duration: 0.007, cutoffHz: 2200, level: 0.35 },
    modes: [
      { hz: 592, level: 0.7, decayPerSecond: 38 },
      { hz: 829, level: 0.9, decayPerSecond: 35 },
      { hz: 894, level: 0.75, decayPerSecond: 38 },
      { hz: 1098, level: 1, decayPerSecond: 35 },
      { hz: 1486, level: 0.9, decayPerSecond: 40 },
      { hz: 1938, level: 0.7, decayPerSecond: 48 },
    ],
    peak: 0.95,
    seed: 1985,
  },
};

/**
 * A two-pole resonator: rings at `hz` and dies at `decayPerSecond` when fed
 * an impulse, which is what a strike on wood does to each mode of the body.
 * Its output is scaled by the inverse of its gain at resonance, so a mode's
 * `level` means what it says whatever its frequency and decay: without that,
 * a low, slow mode came out forty decibels above the others.
 */
function resonator(mode: Mode): (input: number) => number {
  const omega = (2 * Math.PI * mode.hz) / SAMPLE_RATE;
  const r = Math.exp(-mode.decayPerSecond / SAMPLE_RATE);
  const a1 = 2 * r * Math.cos(omega);
  const a2 = -r * r;
  // |H(e^{jω})| = 1 / ((1 - r) · |1 - r·e^{-2jω}|); the scale is its inverse.
  const scale = (1 - r) * Math.hypot(1 - r * Math.cos(2 * omega), r * Math.sin(2 * omega));
  let y1 = 0;
  let y2 = 0;
  return (input) => {
    const y = input + a1 * y1 + a2 * y2;
    y2 = y1;
    y1 = y;
    return y * scale;
  };
}

function synthesise(spec: SoundSpec): Int16Array {
  const length = Math.round(spec.duration * SAMPLE_RATE);
  const noise = noiseSource(spec.seed);
  const alpha = 1 - Math.exp((-2 * Math.PI * spec.burst.cutoffHz) / SAMPLE_RATE);
  const burstLength = Math.round(spec.burst.duration * SAMPLE_RATE);
  const voices = spec.modes.map((mode) => ({ level: mode.level, ring: resonator(mode) }));
  const out = new Float64Array(length);
  // Two one-pole stages in a row: 12 dB per octave. One was not enough to keep
  // the burst's hiss out of the top octaves, where a wooden strike has nothing.
  let filtered = 0;
  let filteredTwice = 0;

  for (let index = 0; index < length; index++) {
    // The strike: filtered noise shaped by a half-sine window, so it neither
    // clicks on the way in nor stops dead. It is what is heard directly.
    let strike = 0;
    if (index < burstLength) {
      filtered += alpha * (noise() - filtered);
      filteredTwice += alpha * (filtered - filteredTwice);
      strike = filteredTwice * Math.sin((Math.PI * index) / burstLength);
    }
    let value = strike * spec.burst.level;
    // The body is rung by a single impulse, not by the noise: an impulse is
    // flat, so each mode gets exactly the level its spec gives it.
    const impulse = index === 0 ? 1 : 0;
    for (const voice of voices) value += voice.ring(impulse) * voice.level;
    out[index] = value;
  }

  // Normalise to the asked peak: the resonators' gain is not worth predicting.
  let max = 0;
  for (const value of out) max = Math.max(max, Math.abs(value));
  const gain = max > 0 ? spec.peak / max : 0;
  const samples = new Int16Array(length);
  for (let index = 0; index < length; index++) samples[index] = Math.round((out[index] ?? 0) * gain * 0x7fff);
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
