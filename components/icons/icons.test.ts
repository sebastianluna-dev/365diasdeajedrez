import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// The icon set is Font Awesome Pro's Duotone, pasted one icon per file, and
// three things keep it findable and legal: each file is named as Font Awesome
// names the icon, so `chess-knight` is found by writing `ChessKnightIcon`;
// each takes `IconProps` and draws both weights behind `variant`; and each
// carries the licence's attribution. The gallery story draws them all. The
// method is docs/content/components/index.mdx, "Icons".

const DIR = fileURLToPath(new URL("./", import.meta.url));

/** The icons that are not Font Awesome's, and so take no `variant`. */
const NOT_FONT_AWESOME: Record<string, string> = {
  "logo-mark-icon.comp.tsx": "the brand's mark",
  "logo-wordmark-icon.comp.tsx": "the brand's wordmark",
  "whatsapp-icon.comp.tsx": "WhatsApp's logo",
};

const icons = readdirSync(DIR).filter((file) => file.endsWith("-icon.comp.tsx"));
const fontAwesome = icons.filter((file) => !(file in NOT_FONT_AWESOME));
const read = (file: string) => readFileSync(DIR + file, "utf8");

/** `chess-knight-icon.comp.tsx` → `ChessKnightIcon`. */
const exportOf = (file: string) =>
  file
    .replace(/\.comp\.tsx$/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

describe("components/icons", () => {
  it("names each icon's export after its file, which is Font Awesome's name for it", () => {
    const wrong = icons.filter((file) => !read(file).includes(`export function ${exportOf(file)}(`));
    expect(wrong).toEqual([]);
  });

  it("gives every Font Awesome icon IconProps, both weights and the licence's attribution", () => {
    const wrong = fontAwesome.flatMap((file) => {
      const source = read(file);
      const missing = [
        source.includes('from "@/components/icons/icon-variant.const"') ? null : "IconProps",
        source.includes('variant = "light"') && source.includes('variant === "solid"') ? null : "variant",
        source.includes("Font Awesome Pro 7.3.1 by @fontawesome") && source.includes("(Commercial License)")
          ? null
          : "attribution",
      ].filter(Boolean);
      return missing.length ? [`${file}: ${missing.join(", ")}`] : [];
    });
    expect(wrong).toEqual([]);
  });

  it("draws every icon in the gallery story", () => {
    const gallery = read("gallery.stories.tsx");
    const missing = icons
      .filter((file) => file !== "logo-wordmark-icon.comp.tsx")
      .filter((file) => !gallery.includes(`Icon: ${exportOf(file)},`));
    expect(missing).toEqual([]);
  });
});
