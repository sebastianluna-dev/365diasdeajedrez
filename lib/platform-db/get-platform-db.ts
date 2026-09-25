import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

// Singletons against the platform database (separate from Payload's), the
// same pattern as lib/payload/get-payload.ts. The guard on globalThis avoids
// exhausting connections with `next dev`'s hot reload.
//
// One client PER GENERATED CLASS, not one in total. The bundler can evaluate
// the generated client in more than one chunk (the render chunk and the one
// of route handlers and server actions, for instance), and each evaluation
// yields a different `PrismaClient` class. A single slot that replaced the
// stored client whenever the class differed closed the pool the other chunk
// was querying on, with every request ping-ponging between the two:
// "Cannot use a pool after calling end on the pool" on every platform page.
//
// Keying by class also keeps what the replacement was for: after `prisma
// generate` the module is evaluated again, the class is a new object, and a
// fresh client is built from the new schema instead of the stored one
// answering "Unknown field" until the server was restarted by hand. The
// client of the previous schema stays in the map until then; that is one idle
// pool per regeneration, and only in development.
type PrismaClientClass = typeof PrismaClient;

const globalStore = globalThis as unknown as { platformDbByClass?: Map<PrismaClientClass, PrismaClient> };

export function getPlatformDb(): PrismaClient {
  globalStore.platformDbByClass ??= new Map();

  let client = globalStore.platformDbByClass.get(PrismaClient);
  if (!client) {
    const connectionString = process.env.PLATFORM_DATABASE_URL;
    if (!connectionString) {
      throw new Error("Falta PLATFORM_DATABASE_URL en el entorno (ver .env.example).");
    }
    client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
    globalStore.platformDbByClass.set(PrismaClient, client);
  }
  return client;
}
