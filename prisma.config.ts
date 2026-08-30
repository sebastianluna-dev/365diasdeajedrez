import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// El CLI de Prisma no lee .env.local por sí solo y este proyecto guarda los
// secretos ahí (igual que Payload con DATABASE_URI). .env sigue disponible
// como alternativa; el primero que defina la variable gana.
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // En Prisma 7 la URL vive aquí (CLI: migrate/studio) y en el adapter del
  // PrismaClient (runtime: lib/platform-db/get-platform-db.ts), no en el schema.
  datasource: {
    url: process.env.PLATFORM_DATABASE_URL,
  },
});
