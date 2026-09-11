import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs-vite";

const fromRoot = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url));

// Proof of concept: one story (PlanCard). If it is adopted, the mocks of
// services/actions and the auth DAL are registered in preview.tsx, and the
// Prisma/Payload entry points get an alias that throws so a story can never
// bundle them by accident.
const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../components/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs"],
  // The app's public/ folder: fonts, engine, sounds and pieces, at the same URLs as in Next.
  staticDirs: ["../public"],
  async viteFinal(config) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string> | undefined),
      // Same two aliases as vitest.config.mts.
      "@": fromRoot(""),
      "server-only": fromRoot("lib/testing/server-only.stub.ts"),
    };
    return config;
  },
};

export default config;
