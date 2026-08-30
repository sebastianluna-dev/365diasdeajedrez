import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pruebas unitarias puras (sin DOM, sin base de datos). El alias replica el
// "paths" de tsconfig.json para que los tests puedan importar "@/lib/...".
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", "lib/platform-db/generated/**"],
  },
});
