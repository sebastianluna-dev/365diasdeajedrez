import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs-vite";

const fromRoot = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url));

// The stories are whatever the glob below finds (every shared piece of the
// platform must have one: components/stories.test.ts). Each one renders a
// component that takes its data and its actions as props (with a stub where
// the app passes a server action), a global class of platform.css as plain
// markup (components/platform/primitives), or a page drawn from the
// stylesheets themselves (components/platform/foundations). Nothing is mocked
// yet: when it is, the mocks of services/actions and the auth DAL are
// registered in preview.tsx, and the Prisma/Payload entry points get an alias
// that throws so a story can never bundle them by accident.
const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../components/**/*.stories.tsx"],
  // addon-a11y runs axe-core on the story in view and lists what it finds in
  // its own panel, under whichever theme the toolbars have chosen.
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
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
