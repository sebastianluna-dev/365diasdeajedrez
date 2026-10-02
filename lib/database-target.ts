// What a database URL points at, without the URL: the host, the database and
// whether it is this machine. It is what can be printed and logged — a
// connection string carries the password — and what the seed and the scripts
// ask before they write. Pure module, without "server-only", so they and their
// tests share it.

export interface DatabaseTarget {
  host: string;
  /** The database's name, the path of the URL. */
  database: string;
  /** This machine: the development container. Anything else is somebody's real data. */
  isLocal: boolean;
}

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1", "[::1]", ""];

/** The target of a connection string, or `null` when it is not one. */
export function databaseTargetOf(url: string | undefined): DatabaseTarget | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
      isLocal: LOCAL_HOSTS.includes(parsed.hostname),
    };
  } catch {
    return null;
  }
}

/** Whether a connection string points at this machine. What cannot be read is not local. */
export function isLocalDatabase(url: string | undefined): boolean {
  return databaseTargetOf(url)?.isLocal ?? false;
}

/** «db.example.com / postgres (gestionada)»: a target in words, for a terminal. */
export function describeDatabaseTarget(target: DatabaseTarget): string {
  return `${target.host || "localhost"} / ${target.database} (${target.isLocal ? "local" : "gestionada"})`;
}
