// Creating and maintaining student accounts from the terminal.
//
// There is no public sign-up on purpose: in an academy the student exists
// because they are enrolled. The administration panel (/administracion/alumnos/nuevo)
// is the usual route; this is the same enrolment from the terminal, "Mis partidas"
// included.
//
//   npm run user:create   -- alumno@correo.com "Nombre Apellido"
//   npm run user:password -- alumno@correo.com
//   npm run user:list
//
// The password is never passed as an argument (it would end up in the shell's
// history): it is asked for on stdin without echo, or taken from
// PLATFORM_USER_PASSWORD.

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/platform-db/generated/client";
import { hashPassword, passwordProblem } from "../lib/platform-auth/password";
import { createDefaultStudy } from "../services/studies/default-study";

const connectionString = process.env.PLATFORM_DATABASE_URL;
if (!connectionString) throw new Error("Falta PLATFORM_DATABASE_URL en el entorno (ver .env.example).");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

/** Asks for the password on the console without showing it while it is typed. */
async function promptPassword(label: string): Promise<string> {
  const fromEnv = process.env.PLATFORM_USER_PASSWORD;
  if (fromEnv) return fromEnv;

  // readline writes through its `output`; it is given one that lets the prompt
  // through and discards the rest, which is precisely the echo of what is typed.
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
    // question() has already written the prompt synchronously: from here on,
    // everything that comes out is echo.
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
  const passwordHash = await hashPassword(password);
  // The account and its "Mis partidas" go in together or neither does, exactly as
  // the administration panel does it (services/staff-students).
  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, displayName: name, passwordHash, passwordUpdatedAt: new Date() },
    });
    await createDefaultStudy(tx, created.id);
    return created;
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

  // Changing the password closes the open sessions: it is what is expected when
  // the reason for the change is that someone else had access.
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
