import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scripts importados del kit de diseño: no son código de la app y usan
    // APIs antiguas de React a propósito.
    "public/**",
    // Cliente de Prisma generado.
    "lib/platform-db/generated/**",
  ]),
]);

export default eslintConfig;
