// Objetivo diario de estudio, en minutos.
//
// En un archivo aparte del servicio porque lo necesitan los dos lados: el
// servidor para validar lo que llega del formulario y el selector del navegador
// para pintar las opciones. Importar el servicio desde el cliente arrastraría el
// acceso a datos hasta el navegador.

/** El mismo que el `@default` de `User.dailyGoalMinutes`. */
export const DEFAULT_GOAL_MINUTES = 30;

/**
 * Lo que se puede elegir. Media hora en el centro y nada por encima de dos
 * horas: pasado eso ya no es un objetivo DIARIO, es un plan de fin de semana, y
 * un objetivo que no se cumple nunca desanima en vez de animar.
 */
export const GOAL_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120] as const;

export function isGoalOption(value: number): boolean {
  return (GOAL_OPTIONS as readonly number[]).includes(value);
}
