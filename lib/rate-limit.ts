import "server-only";
import { logError, logWarning } from "@/lib/logger";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";

// Rate limit for the write server actions. Actions are reachable by direct
// POST, not only from the interface, so it is worth putting a ceiling per
// subject and operation.
//
// The counter lives in the `RateLimit` table and NOT in the process's memory:
// with a Map, two instances behind a load balancer give twice the attempts and
// in serverless every cold start begins at zero — exactly what a brute-force
// attack against the login needs. In the database, the ceiling is a single one
// for the whole app.
//
// The database that already exists was chosen instead of a Redis: it does not
// add one more service that can go down on its own, and the cost is one write
// per protected action, almost always next to another that was going to the
// database anyway.

/**
 * How often expired windows are swept, as a fraction of calls.
 *
 * It is cleaned from the application itself and not with a scheduled job
 * because the table only grows with what it writes itself. One call in a
 * hundred is enough to keep them from piling up, and the deletion does not
 * block the response.
 */
const PURGE_CHANCE = 0.01;

/**
 * Returns true if the operation fits within the limit, and counts it.
 *
 * `key` identifies the subject and the operation, e.g. `${userId}:import` or
 * `login:${email}`. `limit` is how many fit in `windowMs`.
 *
 * Everything happens in ONE statement: the `ON CONFLICT` decides whether the
 * window is still alive — and adds — or has already expired — and starts
 * another —, so two simultaneous requests cannot slip through by reading the
 * same counter before writing it.
 *
 * The times come from the application's clock, not the database's: that way
 * the window's cutoff does not depend on the two clocks agreeing.
 *
 * If the database fails, it is LET THROUGH. That is deliberate: without a
 * database there is no login to protect — checking the password queries it too
 * — and blocking every action over a database incident would be a full-blown
 * outage. But a trace is left: a limit that disappears silently is worse than
 * one that says it has disappeared.
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
      void db.$executeRaw`DELETE FROM "RateLimit" WHERE "resetAt" <= ${now}`.catch((error: unknown) =>
        logWarning("rate-limit", "No se pudieron barrer las ventanas vencidas", { error: String(error) }),
      );
    }

    // With no row returned there is nothing to say: it is let through, as with an error.
    return (rows[0]?.count ?? 1) <= limit;
  } catch (error) {
    logError("rate-limit", "Fallo de la base al contar; la acción se deja pasar sin límite", error, { key });
    return true;
  }
}
