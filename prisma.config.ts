import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// The Prisma CLI does not read .env.local on its own and this project keeps the
// secrets there (just like Payload with DATABASE_URI). .env is still available
// as an alternative; the first one to define the variable wins.
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // In Prisma 7 the URL lives here (CLI: migrate/studio) and in the PrismaClient's
  // adapter (runtime: lib/platform-db/get-platform-db.ts), not in the schema.
  datasource: {
    url: process.env.PLATFORM_DATABASE_URL,
  },
});
