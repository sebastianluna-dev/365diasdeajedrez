// Registro mínimo del servidor: una línea JSON por evento en stderr, que es lo
// que Vercel (y cualquier contenedor) recoge sin configurar nada. No es un
// servicio de observabilidad: es lo justo para que un fallo deje rastro y se
// pueda correlacionar con el `digest` que ve el usuario en pantalla.
//
// Sin "server-only" a propósito: lo usan también el seed, los scripts y
// `instrumentation.ts`, que corren fuera del árbol de React.

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

/** Algo que no rompe la petición pero que alguien debería ver (PGN recortado, purga fallida…). */
export function logWarning(scope: string, message: string, fields: LogFields = {}): void {
  write("warn", scope, message, fields);
}

/** Un fallo de verdad, con el error serializado (nombre, mensaje, pila y `digest` si lo trae). */
export function logError(scope: string, message: string, error: unknown, fields: LogFields = {}): void {
  write("error", scope, message, { ...fields, error: describeError(error) });
}
