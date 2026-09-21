// Rebuilds UserStatDaily from UserActivity, for every account or for one.
//
//   npm run stats:rebuild                       # every account
//   npm run stats:rebuild -- alumno@correo.com  # one account
//
// Needed after a change in how the days are bucketed (2026-09-21: from UTC to
// the study day, America/Mexico_City); harmless any other time, because the
// aggregate is derived and the rebuild is idempotent.

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/platform-db/generated/client";
import { rebuildDailyStats } from "../services/shared/daily-stats";

const connectionString = process.env.PLATFORM_DATABASE_URL;
if (!connectionString) throw new Error("Falta PLATFORM_DATABASE_URL en el entorno (ver .env.example).");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();
  const users = await db.user.findMany({
    where: email ? { email } : {},
    select: { id: true, email: true },
    orderBy: { createdAt: "asc" },
  });
  if (users.length === 0) {
    console.error(email ? `✖ No existe ninguna cuenta con ${email}.` : "No hay cuentas.");
    process.exitCode = 1;
    return;
  }

  for (const user of users) {
    const rows = await rebuildDailyStats(db, user.id);
    console.log(`✔ ${user.email}: ${rows} fila(s) de UserStatDaily`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
