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
  },
  initialGlobals: { theme: "auto" },
  parameters: {
    nextjs: { appDirectory: true },
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => {
      const theme = themeFor(String(context.globals.theme), context.title);
      useEffect(() => {
        document.body.classList.toggle("platform-theme", theme === "platform");
      }, [theme]);
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
