// Dumps the two databases `.env.local` points at, before something that cannot
// be undone: a `db:deploy` against production, a `docker compose down -v`.
//
//   npm run db:backup                    # into ~/Backups/365diasdeajedrez/
//   npm run db:backup -- --dir <folder>  # somewhere else
//
// Neither database can be rebuilt from the code, and a Prisma migration has no
// way back. The dump is made by the `pg_dump` of the development container
// (`npm run db:up`), whose version is pinned to the managed databases', so
// nothing has to be installed and nothing complains about a version.
//
// The connection strings never reach the terminal: they go to the container
// through its environment, and what is printed is the host. The files hold the
// accounts and their password hashes, so they are written for their owner only
// (0600) and OUTSIDE the repository.

import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { spawnSync } from "node:child_process";
import { chmodSync, closeSync, mkdirSync, openSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { databaseTargetOf, describeDatabaseTarget } from "../lib/database-target";

/** The container of docker-compose.yml: its pg_dump is the one that matches the servers. */
const CONTAINER = "365-postgres";

const DATABASES = [
  { variable: "PLATFORM_DATABASE_URL", name: "plataforma" },
  { variable: "DATABASE_URI", name: "payload" },
] as const;

function readFolder(): string {
  const flag = process.argv.indexOf("--dir");
  const chosen = flag >= 0 ? process.argv[flag + 1] : undefined;
  return chosen ? resolve(chosen) : join(homedir(), "Backups", "365diasdeajedrez");
}

/** `20261001-0840`, in local time: the name says when, and sorts by it. */
function stamp(now: Date): string {
  const two = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}${two(now.getMonth() + 1)}${two(now.getDate())}-${two(now.getHours())}${two(now.getMinutes())}`;
}

/** Runs a command in the container with the dump's file on one of its ends. */
function inContainer(command: string, env: Record<string, string>, stdio: { stdin?: number; stdout?: number }) {
  return spawnSync(
    "docker",
    ["exec", "-i", ...Object.keys(env).flatMap((key) => ["-e", key]), CONTAINER, "sh", "-c", command],
    {
      env: { ...process.env, ...env },
      stdio: [stdio.stdin ?? "ignore", stdio.stdout ?? "pipe", "pipe"],
      maxBuffer: 64 * 1024 * 1024,
    },
  );
}

function main(): void {
  const folder = readFolder();
  if (resolve(folder).startsWith(resolve(process.cwd()))) {
    throw new Error(
      "La carpeta de las copias está dentro del repositorio: una copia lleva cuentas y contraseñas. Elige otra con --dir.",
    );
  }
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  const when = stamp(new Date());
  let failed = false;

  for (const { variable, name } of DATABASES) {
    const raw = process.env[variable];
    const target = databaseTargetOf(raw);
    if (!raw || !target) {
      console.error(`✖ ${name}: ${variable} no está definida o no es una URL.`);
      failed = true;
      continue;
    }

    const url = new URL(raw);
    // Inside the container there is no root.crt for `sslmode=verify-full`; the
    // system's trusted roots are there, and this points pg_dump at them.
    if (!target.isLocal && !url.searchParams.has("sslrootcert")) url.searchParams.set("sslrootcert", "system");

    const file = join(folder, `${name}-${when}.dump`);
    const out = openSync(file, "w", 0o600);
    const dump = inContainer('pg_dump "$PGURL" --format=custom --no-owner', { PGURL: url.toString() }, { stdout: out });
    closeSync(out);
    chmodSync(file, 0o600);

    if (dump.status !== 0) {
      const reason = String(dump.stderr ?? dump.error ?? "")
        .replaceAll(url.password, "***")
        .trim();
      console.error(`✖ ${name}: pg_dump falló contra ${describeDatabaseTarget(target)}.\n  ${reason.slice(0, 600)}`);
      failed = true;
      continue;
    }

    // A dump that cannot be listed is not a copy: it is read back before it is trusted.
    const input = openSync(file, "r");
    const listing = inContainer("pg_restore --list", {}, { stdin: input });
    closeSync(input);
    const tables = String(listing.stdout ?? "")
      .split("\n")
      .filter((line) => line.includes("TABLE DATA")).length;
    if (listing.status !== 0 || tables === 0) {
      console.error(`✖ ${name}: la copia se escribió pero no se puede leer (${file}).`);
      failed = true;
      continue;
    }

    console.log(
      `✔ ${name}: ${describeDatabaseTarget(target)} → ${file} (${statSync(file).size} bytes, ${tables} tablas con datos)`,
    );
  }

  if (failed) process.exitCode = 1;
}

main();
