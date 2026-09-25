"use client";

// Board sounds, served from public/sounds.
//
// They load LAZILY and only when a sound is needed: they are two files and
// there is no point requesting them in every viewer of a page that may
// never sound. Each playback uses a clone of the element because navigating
// quickly with the arrow keys fires several in a row, and reusing the same
// element would cut the previous one mid-note.

export type MoveSoundKind = "move" | "capture";

// Only two, lichess's "standard" Move and Capture (their licence status is
// recorded in the local WARNINGS.md; `npm run sounds:make` is the way out).
// Check does not sound: it is a state of the position, not a gesture on the
// board, and the two sounds are gestures.
const SOURCES: Record<MoveSoundKind, string> = {
  move: "/sounds/move.mp3",
  capture: "/sounds/capture.mp3",
};

const cache = new Map<MoveSoundKind, HTMLAudioElement>();

function elementFor(kind: MoveSoundKind): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  let element = cache.get(kind);
  if (!element) {
    element = new Audio(SOURCES[kind]);
    element.preload = "auto";
    cache.set(kind, element);
  }
  return element;
}

export function playMoveSound(kind: MoveSoundKind): void {
  const element = elementFor(kind);
  if (!element) return;
  const voice = element.cloneNode() as HTMLAudioElement;
  voice.volume = 0.6;
  // Without a prior user gesture the browser rejects the promise; that is
  // expected and there is nothing to report.
  void voice.play().catch(() => undefined);
}
