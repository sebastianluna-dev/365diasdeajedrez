import { useEffect } from "react";
import type { Preview } from "@storybook/nextjs-vite";
import "@/app/(frontend)/globals.css";
import "@/app/(platform)/platform.css";
import "./preview.css";

type Theme = "site" | "platform";

// The app picks the theme by layout: the public site gets globals.css on a
// bare <body>, the platform and the login add platform.css and
// <body class="platform-theme">. Both sheets are loaded here and the toolbar
// toggles the class, which reproduces either layout exactly.
function themeFor(global: string, title: string): Theme {
  if (global === "site" || global === "platform") return global;
  return title.startsWith("platform/") || title.startsWith("auth/") ? "platform" : "site";
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
    // The overview opens the sidebar, as the sheet of a UI kit does; then what
    // the pieces are made of, the pieces, and the sections built from them.
    options: {
      storySort: { order: ["platform", ["Overview", "foundations", "primitives", "shared", "sections"], "site"] },
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
