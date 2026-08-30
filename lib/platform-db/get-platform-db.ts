import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

// Singleton contra la base de datos de la plataforma (separada de Payload),
// mismo patrón que lib/payload/get-payload.ts. El guard en globalThis evita
// agotar conexiones con el hot-reload de `next dev`.
const globalStore = globalThis as unknown as { platformDb?: PrismaClient };

export function getPlatformDb(): PrismaClient {
  if (!globalStore.platformDb) {
    const connectionString = process.env.PLATFORM_DATABASE_URL;
    if (!connectionString) {
      throw new Error("Falta PLATFORM_DATABASE_URL en el entorno (ver .env.example).");
    }
    globalStore.platformDb = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }
  return globalStore.platformDb;
}
