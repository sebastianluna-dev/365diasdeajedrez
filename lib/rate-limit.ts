import "server-only";

// Límite de frecuencia en memoria para las server actions de escritura.
// Las actions son alcanzables por POST directo, no sólo desde la interfaz, así
// que conviene poner un techo por usuario y operación.
//
// Limitación conocida: el contador vive en el proceso, de modo que con varias
// instancias el límite es por instancia. Suficiente como cortafuegos básico en
// esta etapa; cuando exista autenticación real y despliegue multi-instancia
// debe moverse a un almacén compartido (ver MEJORAS.md).

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Evita que el mapa crezca sin control en procesos de larga vida. */
function purgeExpired(now: number): void {
  if (windows.size < 1000) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

/**
 * Devuelve true si la operación cabe dentro del límite y la contabiliza.
 * `key` debe identificar al usuario y a la operación, p. ej. `${userId}:import`.
 */
export function allowAction(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  purgeExpired(now);

  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
