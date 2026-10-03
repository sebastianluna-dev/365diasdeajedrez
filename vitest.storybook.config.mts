import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const configDir = fileURLToPath(new URL("./.storybook", import.meta.url));

// The stories as tests (`npm run test:storybook`): every story .storybook/main.ts
// finds is rendered in a headless Chromium with the Vite config Storybook builds
// with (its aliases, public/ as static files, the preview and its decorators),
// its `play` function runs, and then addon-a11y runs axe on what it left on
// screen. A violation fails the story unless the story says
// `a11y: { test: "todo" }` (.storybook/preview.tsx).
//
// Twice, once per theme of the platform: the `scheme` toolbar global set to
// light and to dark, since a contrast can fail in one and pass in the other.
//
// A config file apart from vitest.config.mts, not more entries of its
// `projects`: Vitest builds every listed project before it filters them with
// `--project`, and building these loads Storybook, Next's config and Next's
// .env files into the process. `npm test` stays the Node run it was.
export default defineConfig({
  test: {
    projects: (["light", "dark"] as const).map((scheme) => ({
      plugins: [storybookTest({ configDir, initialGlobals: { scheme } })],
      test: {
        name: `storybook-${scheme}`,
        browser: {
          enabled: true,
          headless: true,
          provider: playwright(),
          instances: [{ browser: "chromium" as const }],
        },
      },
    })),
  },
});
