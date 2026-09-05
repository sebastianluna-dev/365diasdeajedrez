export interface StudyGoal {
  /** Días seguidos estudiando, contando hacia atrás desde hoy. */
  streakDays: number;
  /** Minutos estudiados hoy, sumando la duración de las lecciones terminadas. */
  minutesToday: number;
  /** Los que el alumno se marca al día. */
  goalMinutes: number;
  /** Cuánto lleva del objetivo, 0–100 y tapado arriba: pasarse no es un 140 %. */
  percent: number;
}
