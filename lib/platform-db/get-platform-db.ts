import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

// Singleton contra la base de datos de la plataforma (separada de Payload),
// mismo patrón que lib/payload/get-payload.ts. El guard en globalThis evita
// agotar conexiones con el hot-reload de `next dev`.
const globalStore = globalThis as unknown as { platformDb?: PrismaClient };

/**
 * Si el cliente guardado se generó con OTRO esquema.
 *
 * El guard de `globalThis` sobrevive al hot-reload, que es para lo que está,
 * pero también sobrevivía a `prisma generate`: tras cambiar el esquema la
 * instancia seguía siendo la anterior y cualquier campo nuevo daba «Unknown
 * field», con la única cura de reiniciar el servidor a mano.
 *
 * Se detecta comparando la CLASE: cuando el cliente generado cambia, su módulo
 * se vuelve a evaluar y `PrismaClient` es un objeto distinto del que construyó
 * la instancia guardada. Un hot-reload que no toque el cliente no cambia esa
 * identidad, así que la conexión se sigue reutilizando como antes.
 */
function isStale(client: PrismaClient): boolean {
  return client.constructor !== PrismaClient;
}

export function getPlatformDb(): PrismaClient {
  if (globalStore.platformDb && isStale(globalStore.platformDb)) {
    // Se cierra la vieja para no dejar la conexión colgando en el pool.
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
