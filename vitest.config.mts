import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pruebas unitarias puras (sin DOM, sin base de datos). El alias "@" replica el
// "paths" de tsconfig.json para que los tests puedan importar "@/lib/...".
//
// "server-only" se sustituye por un módulo vacío: en la app lo aliasa Next,
// pero aquí no existe y bloqueaba cualquier import de la capa de servidor.
// Lo que de verdad protege (que no acabe en un Client Component) lo sigue
// haciendo el bundler de Next; las pruebas corren en Node.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "server-only": fileURLToPath(new URL("./lib/testing/server-only.stub.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "lib/platform-db/generated/**"],
    coverage: {
      provider: "v8",
      // Sólo código: los `__fixtures__` (PGN de prueba) no son módulos y v8
      // intentaba parsearlos.
      include: ["lib/**/*.ts", "services/**/*.ts", "constants/**/*.ts", "hooks/**/*.ts"],
      exclude: ["lib/platform-db/generated/**", "lib/testing/**", "**/__fixtures__/**", "**/*.test.*", "**/*.types.ts"],
    },
  },
});
