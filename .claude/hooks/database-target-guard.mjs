// A PreToolUse hook for Bash, registered in .claude/settings.json: before a
// command that writes to (or runs the app against) the databases `.env.local`
// names, it asks the person when either of them is not this machine.
//
// The permission rules cannot see where a command writes: `npm run db:migrate`
// is harmless against the container and destructive against the managed
// database, and the same text reaches both. This reads the two URLs the way
// dotenv does (the environment first, then `.env.local`, then `.env`) and
// answers "ask" when one of them points anywhere but localhost. It prints no
// URL and no host: only which variable is managed.
//
// It fails closed: if the input or the files cannot be read, a database
// command gets "ask"; and settings.json launches it as `node … || exit 2`, so a
// hook that cannot even start blocks the call instead of letting it through.
// A command that touches no database gets no output at all, the normal
// permission flow goes on, and it costs one Node start-up.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const VARIABLES = ["PLATFORM_DATABASE_URL", "DATABASE_URI"];
const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1", "[::1]", ""];

/**
 * Commands that read `.env.local` and write to its databases, or run the app
 * against them (Payload pushes its schema on `next dev`). `db:target` only
 * prints the hosts, and `db:generate` (`prisma generate`), `prisma format` and
 * `validate` touch no database: they are left alone.
 */
const DATABASE_COMMANDS = [
  /\bnpm\s+run\s+(?:dev|dev:lan|start|build)\b/,
  /\bnpm\s+run\s+db:(?!target\b|generate\b)[\w:-]+/,
  /\bnpm\s+run\s+(?:user|collections|stats|positions):[\w:-]+/,
  /\b(?:npx\s+|npm\s+exec\s+)?prisma\s+(?!generate\b|format\b|validate\b|--version\b|-v\b)[a-z]/,
  /\b(?:npx\s+)?tsx\s+(?:\.\/)?(?:scripts|prisma)\//,
  /\b(?:npx\s+)?payload\s+[a-z]/,
  /\bnext\s+(?:dev|start|build)\b/,
];

export function isDatabaseCommand(command) {
  return DATABASE_COMMANDS.some((pattern) => pattern.test(command));
}

/** `KEY=value` lines of a dotenv file, as dotenv reads them; `{}` when the file is missing. */
export function parseDotenv(text) {
  const values = {};
  for (const raw of text.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(raw);
    if (!match) continue;
    let value = match[2].trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'" || quote === "`") && value.indexOf(quote, 1) > 0) {
      value = value.slice(1, value.indexOf(quote, 1));
    } else {
      // An unquoted value ends at a ` #` comment.
      value = value.replace(/\s+#.*$/, "").trim();
    }
    if (!(match[1] in values)) values[match[1]] = value;
  }
  return values;
}

function readDotenv(path) {
  try {
    return parseDotenv(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

/** Whether a connection string points at this machine; what cannot be read is not local. */
export function isLocalUrl(url) {
  if (!url) return false;
  try {
    return LOCAL_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** The variables whose database is not this machine (or cannot be told), in the order dotenv resolves them. */
export function managedVariables(projectDir, environment) {
  const local = readDotenv(join(projectDir, ".env.local"));
  const shared = readDotenv(join(projectDir, ".env"));
  return VARIABLES.filter((name) => !isLocalUrl(environment[name] ?? local[name] ?? shared[name]));
}

function ask(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: reason },
    }),
  );
}

function main() {
  let command;
  try {
    command = JSON.parse(readFileSync(0, "utf8"))?.tool_input?.command;
  } catch {
    ask("El guardián de bases no pudo leer el comando: confirma antes de ejecutarlo.");
    return;
  }
  if (typeof command !== "string" || !isDatabaseCommand(command)) return;

  try {
    const managed = managedVariables(process.env.CLAUDE_PROJECT_DIR ?? process.cwd(), process.env);
    if (managed.length === 0) return;
    ask(
      `Este comando usa las bases a las que apunta .env.local, y ${managed.join(" y ")} no apunta a localhost ` +
        "(una base gestionada, o una URL que no se puede leer). Confirma que quieres trabajar sobre datos reales; " +
        "`npm run db:target` dice a qué host apunta cada una.",
    );
  } catch {
    ask("El guardián de bases no pudo leer .env.local: confirma antes de ejecutar este comando.");
  }
}

// Run only as the hook, not when a test imports the functions above.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
