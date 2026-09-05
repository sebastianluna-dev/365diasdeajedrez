import { cache } from "react";
import { DEFAULT_GOAL_MINUTES } from "@/constants/platform/study-goal.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { dayKey, startOfDay, streakLength } from "@/lib/study-streak";
import type { StudyGoal } from "./study-goal.types";

// Racha y objetivo diario: las dos cifras de la columna de «Mis cursos».
//
// Ninguna de las dos se guarda como tal. La racha se DERIVA de la actividad y
// los minutos de hoy de las lecciones terminadas hoy; lo único que se almacena
// es el objetivo, que es una decisión del alumno y no un cálculo.

/** Hasta dónde mirar hacia atrás para la racha. */
const STREAK_WINDOW_DAYS = 400;

/**
 * Días con actividad, de más reciente a más antiguo, dentro de la ventana.
 *
 * Cuenta CUALQUIER actividad —una lección, una clase, un ejercicio, una partida
 * analizada—, no sólo las lecciones: la racha premia haber estudiado, y quien
 * pasó la tarde analizando sus partidas estudió.
 *
 * La ventana existe para que la consulta no crezca con los años. Una racha más
 * larga que eso se seguiría contando entera sólo hasta el borde, que es un
 * problema que da gusto tener.
 */
async function activeDaysOf(userId: string, now: Date): Promise<Set<string>> {
  const since = new Date(now.getTime() - STREAK_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const rows = await getPlatformDb().userActivity.findMany({
    where: { userId, occurredAt: { gte: since } },
    select: { occurredAt: true },
    orderBy: { occurredAt: "desc" },
  });
  return new Set(rows.map((row) => dayKey(row.occurredAt, STUDY_DAY_TIMEZONE)));
}

/**
 * Minutos estudiados hoy: la duración estimada de las lecciones que terminó
 * hoy. Las que no tienen duración cuentan como cero, igual que en el avance del
 * curso.
 */
async function minutesTodayOf(userId: string, today: string): Promise<number> {
  const rows = await getPlatformDb().lessonProgress.findMany({
    where: { userId, completedAt: { gte: startOfDay(today, STUDY_DAY_TIMEZONE) } },
    select: { lesson: { select: { estimatedDuration: true } } },
  });
  return rows.reduce((total, row) => total + (row.lesson.estimatedDuration ?? 0), 0);
}

export const getStudyGoal = cache(async (): Promise<StudyGoal> => {
  const user = await getCurrentUser();
  const now = new Date();
  const today = dayKey(now, STUDY_DAY_TIMEZONE);

  const [activeDays, minutesToday, row] = await Promise.all([
    activeDaysOf(user.id, now),
    minutesTodayOf(user.id, today),
    getPlatformDb().user.findUnique({ where: { id: user.id }, select: { dailyGoalMinutes: true } }),
  ]);

  const goalMinutes = row?.dailyGoalMinutes ?? DEFAULT_GOAL_MINUTES;

  return {
    streakDays: streakLength(activeDays, today),
    minutesToday,
    goalMinutes,
    // Tapado arriba: la barra no puede desbordarse y «120 %» no dice nada que
    // no diga ya «45 de 30 minutos».
    percent: goalMinutes === 0 ? 0 : Math.min(100, Math.round((minutesToday / goalMinutes) * 100)),
  };
});
