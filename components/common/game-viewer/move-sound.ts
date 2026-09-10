"use client";

// Sonidos de tablero, servidos desde public/sounds.
//
// Se cargan PEREZOSAMENTE y sólo cuando hace falta sonar: son dos ficheros y
// no tiene sentido pedirlos en cada visor de una página que quizá nunca suene.
// Cada reproducción usa un clon del elemento porque navegar rápido con las
// flechas dispara varias seguidas, y reutilizar el mismo elemento cortaría la
// anterior a media nota.

export type MoveSoundKind = "move" | "capture";

// Sólo dos, sacados del paquete «standard» de lichess. Allí el jaque NO suena
// (su Check.mp3 es un enlace a Silence.mp3), así que darle sonido propio
// sería inventarse el paquete.
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
  // Sin gesto previo del usuario el navegador rechaza la promesa; es lo
  // esperado y no hay nada que reportar.
  void voice.play().catch(() => undefined);
}
