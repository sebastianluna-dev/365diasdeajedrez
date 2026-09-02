// Cuándo toca volver a repasar una lección.
//
// Escalera de intervalos que sube con cada repaso PERFECTO seguido y vuelve al
// principio al fallar. Se eligió frente a un SM-2 porque es explicable al alumno
// —«dos repasos perfectos y no vuelve hasta dentro de una semana»— y porque se
// puede comprobar leyendo una tabla, no ajustando un factor opaco.
//
// Módulo puro: sin Prisma ni React, para poder ejercitarlo entero en tests.

/**
 * Días hasta el siguiente repaso, por peldaño.
 *
 * El primero es 0: un repaso fallado vuelve a estar pendiente HOY, que es lo que
 * espera quien acaba de equivocarse. A partir de ahí sube.
 */
export const REVIEW_INTERVALS_DAYS = [0, 1, 3, 7, 21, 60] as const;

/** Último peldaño; una vez arriba, no se sigue subiendo. */
export const MAX_MASTERY_LEVEL = REVIEW_INTERVALS_DAYS.length - 1;

export interface ReviewState {
  /** Repasos perfectos seguidos ANTES de este intento. */
  consecutivePerfect: number;
  masteryLevel: number;
}

export interface ReviewOutcome {
  consecutivePerfect: number;
  masteryLevel: number;
  intervalDays: number;
  nextReviewAt: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * El estado de repaso tras un intento.
 *
 * Sólo un intento PERFECTO sube el peldaño: acertar con pistas o tras un fallo
 * demuestra reconocimiento, no memoria, y es justo lo que el repaso mide. Un
 * fallo devuelve al principio en vez de bajar un escalón, porque olvidar una
 * línea no es «saberla un poco menos».
 */
export function applyReview(state: ReviewState, isPerfect: boolean, now: Date = new Date()): ReviewOutcome {
  const consecutivePerfect = isPerfect ? state.consecutivePerfect + 1 : 0;
  const masteryLevel = isPerfect ? Math.min(state.masteryLevel + 1, MAX_MASTERY_LEVEL) : 0;
  const intervalDays = REVIEW_INTERVALS_DAYS[masteryLevel];

  return {
    consecutivePerfect,
    masteryLevel,
    intervalDays,
    nextReviewAt: new Date(now.getTime() + intervalDays * DAY_MS),
  };
}

/** ¿Toca repasarla ya? Sin fecha programada, sí: nunca se ha entrenado. */
export function isDueForReview(nextReviewAt: Date | null | undefined, now: Date = new Date()): boolean {
  return !nextReviewAt || nextReviewAt.getTime() <= now.getTime();
}

/**
 * Precisión del intento, 0-100.
 *
 * Se mide sobre las jugadas ACERTADAS A LA PRIMERA, no sobre las completadas: la
 * sesión no avanza hasta acertar, así que contar las completadas daría siempre
 * el 100 %. Es una métrica distinta de «perfecto», que además exige no haber
 * usado pistas.
 */
export function accuracyPercent(correctMoves: number, requiredMoves: number): number {
  if (requiredMoves <= 0) return 0;
  return Math.round((Math.min(correctMoves, requiredMoves) / requiredMoves) * 100);
}
