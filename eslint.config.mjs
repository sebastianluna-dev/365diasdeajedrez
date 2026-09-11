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
    // Scripts imported from the design kit: they are not app code and use old
    // React APIs on purpose.
    "public/**",
    // Generated Prisma client.
    "lib/platform-db/generated/**",
    // Vitest coverage report (`npm run test:coverage`).
    "coverage/**",
    // Documentation site (Nextra): it is another app, with its own package.json.
    "docs/**",
    // Static Storybook build (`npm run storybook:build`).
    "storybook-static/**",
  ]),
]);

export default eslintConfig;
