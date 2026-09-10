import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pure unit tests (no DOM, no database). The "@" alias replicates the "paths" of
// tsconfig.json so the tests can import "@/lib/...".
//
// "server-only" is replaced by an empty module: in the app Next aliases it, but
// here it does not exist and it blocked any import of the server layer. What it
// really protects (that it does not end up in a Client Component) is still done
// by Next's bundler; the tests run in Node.
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
    exclude: ["node_modules/**", ".next/**", "lib/platform-db/generated/**", "docs/**"],
    coverage: {
      provider: "v8",
      // Code only: the `__fixtures__` (test PGNs) are not modules and v8 tried to
      // parse them.
      include: ["lib/**/*.ts", "services/**/*.ts", "constants/**/*.ts", "hooks/**/*.ts"],
      exclude: ["lib/platform-db/generated/**", "lib/testing/**", "**/__fixtures__/**", "**/*.test.*", "**/*.types.ts"],
    },
  },
});
