import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

// Singleton against the platform database (separate from Payload's), the same
// pattern as lib/payload/get-payload.ts. The guard on globalThis avoids
// exhausting connections with `next dev`'s hot reload.
const globalStore = globalThis as unknown as { platformDb?: PrismaClient };

/**
 * Whether the stored client was generated from ANOTHER schema.
 *
 * The `globalThis` guard survives hot reload, which is what it is for, but it
 * also survived `prisma generate`: after changing the schema the instance was
 * still the previous one and any new field gave "Unknown field", with the only
 * cure being restarting the server by hand.
 *
 * It is detected by comparing the CLASS: when the generated client changes, its
 * module is evaluated again and `PrismaClient` is a different object from the
 * one that built the stored instance. A hot reload that does not touch the
 * client does not change that identity, so the connection keeps being reused as before.
 */
function isStale(client: PrismaClient): boolean {
  return client.constructor !== PrismaClient;
}

export function getPlatformDb(): PrismaClient {
  if (globalStore.platformDb && isStale(globalStore.platformDb)) {
    // The old one is closed so as not to leave the connection hanging in the pool.
    void globalStore.platformDb.$disconnect();
    globalStore.platformDb = undefined;
  }

  if (!globalStore.platformDb) {
    const connectionString = process.env.PLATFORM_DATABASE_URL;
    if (!connectionString) {
      throw new Error("Falta PLATFORM_DATABASE_URL en el entorno (ver .env.example).");
    }
    globalStore.platformDb = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }
  return globalStore.platformDb;
}
