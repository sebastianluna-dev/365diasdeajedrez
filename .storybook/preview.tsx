import { useEffect } from "react";
import type { Preview } from "@storybook/nextjs-vite";
import "@/app/(frontend)/globals.css";
import "@/app/(platform)/platform.css";
import "./preview.css";

type Theme = "site" | "platform";

// The app picks the theme by layout: the public site gets globals.css on a
// bare <body>, the platform and the login add platform.css and
// <body class="platform-theme">. Both sheets are loaded here and the toolbar
// toggles the class, which reproduces either layout exactly. The chess pieces
// and the icons belong to both products but are drawn with the platform's
// tokens, so "auto" gives them the platform's theme too.
const PLATFORM_TITLES = ["platform/", "auth/", "chess/", "icons/"];

function themeFor(global: string, title: string): Theme {
  if (global === "site" || global === "platform") return global;
  return PLATFORM_TITLES.some((prefix) => title.startsWith(prefix)) ? "platform" : "site";
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Product theme",
      toolbar: { icon: "paintbrush", items: ["auto", "site", "platform"], dynamicTitle: true },
    },
    // The platform has a light and a dark theme, decided by `color-scheme` on
    // the `:root` from `data-theme` (see app/(platform)/platform.css). "auto"
    // leaves the attribute off, which is the app's own default: follow the
    // machine.
    scheme: {
      description: "Light / dark",
      toolbar: { icon: "contrast", items: ["auto", "light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "auto", scheme: "auto" },
  parameters: {
    nextjs: { appDirectory: true },
    layout: "fullscreen",
    // addon-a11y runs axe on every story once its `play` function is done. In
    // the Accessibility panel that is a look; under `npm run test:storybook`
    // (and so in CI) "error" makes a violation fail the story. A story with a
    // known failure sets `a11y: { test: "todo" }` on itself, with a comment
    // naming the rule, until its component is fixed.
    a11y: { test: "error" },
    // The overview opens the sidebar, as the sheet of a UI kit does; then what
    // the pieces are made of, the pieces, and the sections built from them;
    // then the pieces both products share, and the site.
    options: {
      storySort: {
        order: ["platform", ["Overview", "foundations", "primitives", "shared", "sections"], "icons", "chess", "site"],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = themeFor(String(context.globals.theme), context.title);
      const scheme = String(context.globals.scheme);
      useEffect(() => {
        document.body.classList.toggle("platform-theme", theme === "platform");
      }, [theme]);
      useEffect(() => {
        const root = document.documentElement;
        if (scheme === "light" || scheme === "dark") root.setAttribute("data-theme", scheme);
        else root.removeAttribute("data-theme");
      }, [scheme]);
      return (
        <div className="sb-canvas">
          <Story />
        </div>
      );
    },
  ],
  tags: ["autodocs"],
};

export default preview;
