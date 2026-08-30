// Alta y mantenimiento de cuentas de alumno desde la terminal.
//
// No hay registro público a propósito: en una academia el alumno existe porque
// se le da de alta. Mientras no exista el panel del profesor (MEJORAS #15),
// esta es la vía oficial.
//
//   npm run user:create   -- alumno@correo.com "Nombre Apellido"
//   npm run user:password -- alumno@correo.com
//   npm run user:list
//
// La contraseña nunca se pasa como argumento (acabaría en el historial del
// shell): se pide por stdin sin eco, o se toma de PLATFORM_USER_PASSWORD.

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/platform-db/generated/client";
import { hashPassword, passwordProblem } from "../lib/platform-auth/password";

const connectionString = process.env.PLATFORM_DATABASE_URL;
if (!connectionString) throw new Error("Falta PLATFORM_DATABASE_URL en el entorno (ver .env.example).");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

/** Pide la contraseña por consola sin mostrarla mientras se teclea. */
async function promptPassword(label: string): Promise<string> {
  const fromEnv = process.env.PLATFORM_USER_PASSWORD;
  if (fromEnv) return fromEnv;

  // readline escribe por su `output`; se le da uno que deja pasar el prompt y
  // descarta el resto, que es justamente el eco de lo que se teclea.
  let silenced = false;
  const output = new Writable({
    write(chunk, _encoding, done) {
      if (!silenced) process.stdout.write(chunk);
      done();
    },
  });

  const rl = createInterface({ input: process.stdin, output, terminal: true });
  return new Promise<string>((resolve) => {
    rl.question(label, (value) => {
      rl.close();
      process.stdout.write("\n");
      resolve(value);
    });
    // question() ya ha escrito el prompt de forma síncrona: a partir de aquí
    // todo lo que salga es eco.
    silenced = true;
  });
}

async function readValidPassword(): Promise<string> {
  const password = await promptPassword("Contraseña: ");
  const problem = passwordProblem(password);
  if (problem) fail(problem);
  return password;
}

function normalizeEmail(raw: string | undefined): string {
  const email = (raw ?? "").trim().toLowerCase();
  if (!EMAIL_SHAPE.test(email)) fail("Indica un correo válido.");
  return email;
}

async function createUser(rawEmail: string | undefined, displayName: string | undefined): Promise<void> {
  const email = normalizeEmail(rawEmail);
  const name = (displayName ?? "").trim();
  if (name.length === 0) fail('Indica el nombre del alumno entre comillas, p. ej. "Ana Pérez".');

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) fail(`Ya existe una cuenta con ${email}. Usa \`npm run user:password\` para cambiar su contraseña.`);

  const password = await readValidPassword();
  const user = await db.user.create({
    data: { email, displayName: name, passwordHash: await hashPassword(password), passwordUpdatedAt: new Date() },
  });

  console.log(`✔ Alumno creado: ${user.displayName} <${user.email}>`);
}

async function setPassword(rawEmail: string | undefined): Promise<void> {
  const email = normalizeEmail(rawEmail);
  const user = await db.user.findUnique({ where: { email }, select: { id: true, displayName: true } });
  if (!user) fail(`No existe ninguna cuenta con ${email}.`);

  const password = await readValidPassword();
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password), passwordUpdatedAt: new Date() },
  });

  // Cambiar la contraseña cierra las sesiones abiertas: es lo que se espera
  // cuando el motivo del cambio es que alguien más tenía acceso.
  const { count } = await db.session.deleteMany({ where: { userId: user.id } });
  console.log(`✔ Contraseña actualizada para ${user.displayName} (${count} sesión/es cerradas).`);
}

async function listUsers(): Promise<void> {
  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      email: true,
      displayName: true,
      passwordHash: true,
      lastLoginAt: true,
      _count: { select: { sessions: true } },
    },
  });

  if (users.length === 0) {
    console.log("No hay cuentas todavía.");
    return;
  }

  for (const user of users) {
    const credential = user.passwordHash ? "con contraseña" : "SIN CONTRASEÑA (no puede entrar)";
    const lastLogin = user.lastLoginAt ? user.lastLoginAt.toISOString() : "nunca";
    console.log(
      `· ${user.displayName} <${user.email}> — ${credential} · último acceso: ${lastLogin} · sesiones: ${user._count.sessions}`,
    );
  }
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "create":
      await createUser(args[0], args[1]);
      break;
    case "password":
      await setPassword(args[0]);
      break;
    case "list":
      await listUsers();
      break;
    default:
      fail("Comandos: create <correo> <nombre> · password <correo> · list");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
