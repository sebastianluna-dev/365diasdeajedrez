// Minimal server logging: one JSON line per event on stderr, which is what
// Vercel (and any container) collects without configuring anything. It is not
// an observability service: it is just enough for a failure to leave a trace
// and to be correlated with the `digest` the user sees on screen.
//
// Without "server-only" on purpose: it is also used by the seed, the scripts
// and `instrumentation.ts`, which run outside the React tree.

type LogLevel = "warn" | "error";
type LogFields = Record<string, unknown>;

interface ErrorFields {
  name?: string;
  message: string;
  stack?: string;
  digest?: string;
}

function describeError(error: unknown): ErrorFields {
  if (error instanceof Error) {
    const digest = "digest" in error && typeof error.digest === "string" ? error.digest : undefined;
    return { name: error.name, message: error.message, stack: error.stack, digest };
  }
  return { message: String(error) };
}

function write(level: LogLevel, scope: string, message: string, fields: LogFields): void {
  const line = JSON.stringify({ level, scope, message, time: new Date().toISOString(), ...fields });
  if (level === "error") console.error(line);
  else console.warn(line);
}

/** Something that does not break the request but that someone should see (truncated PGN, failed purge…). */
export function logWarning(scope: string, message: string, fields: LogFields = {}): void {
  write("warn", scope, message, fields);
}

/** A real failure, with the error serialised (name, message, stack and `digest` if it carries one). */
export function logError(scope: string, message: string, error: unknown, fields: LogFields = {}): void {
  write("error", scope, message, { ...fields, error: describeError(error) });
}
