import "server-only";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";

// Límite de frecuencia de las server actions de escritura. Las actions son
// alcanzables por POST directo, no sólo desde la interfaz, así que conviene
// poner un techo por sujeto y operación.
//
// El contador vive en la tabla `RateLimit` y NO en la memoria del proceso: con
// un Map, dos instancias detrás de un balanceador dan el doble de intentos y en
// serverless cada arranque en frío empieza a cero —justo lo que necesita un
// ataque de fuerza bruta contra el login—. En la base, el techo es uno solo
// para toda la app.
//
// Se eligió la base que ya existe en lugar de un Redis: no añade un servicio
// más que pueda caerse por su cuenta, y el coste es una escritura por acción
// protegida, casi siempre pegada a otra que ya iba a la base de todas formas.

/**
 * Cada cuánto se barren las ventanas vencidas, en tanto por uno de llamadas.
 *
 * Se limpia desde la propia aplicación y no con una tarea programada porque la
 * tabla sólo crece con lo que ella misma escribe. Una de cada cien llamadas
 * basta para que no se acumulen, y el borrado no bloquea la respuesta.
 */
const PURGE_CHANCE = 0.01;

/**
 * Devuelve true si la operación cabe dentro del límite, y la contabiliza.
 *
 * `key` identifica al sujeto y a la operación, p. ej. `${userId}:import` o
 * `login:${email}`. `limit` es cuántas caben en `windowMs`.
 *
 * Todo ocurre en UNA sentencia: el `ON CONFLICT` decide si la ventana sigue
 * viva —y suma— o si ya venció —y arranca otra—, así que dos peticiones
 * simultáneas no pueden colarse leyendo el mismo contador antes de escribirlo.
 *
 * Las horas salen del reloj de la aplicación, no del de la base: así el corte
 * de la ventana no depende de que los dos relojes coincidan.
 *
 * Si la base falla, se DEJA PASAR. Es deliberado: sin base no hay login que
 * proteger —la comprobación de la contraseña también la consulta— y bloquear
 * cada acción por una incidencia de la base sería un apagón en toda regla.
 */
export async function allowAction(key: string, limit: number, windowMs: number): Promise<boolean> {
  const db = getPlatformDb();
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const rows = await db.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
      RETURNING "count"
    `;

    if (Math.random() < PURGE_CHANCE) {
      void db.$executeRaw`DELETE FROM "RateLimit" WHERE "resetAt" <= ${now}`.catch(() => undefined);
    }

    // Sin fila devuelta no hay nada que decir: se deja pasar, como con un error.
    return (rows[0]?.count ?? 1) <= limit;
  } catch {
    return true;
  }
}
