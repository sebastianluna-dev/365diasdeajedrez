import localFont from "next/font/local";

/**
 * Typography of the authenticated platform. The public site keeps Gramatika
 * and Suisse Intl (app/(frontend)/fonts.ts); here SF Pro Display rules for
 * display AND text.
 *
 * FIVE weights, because the platform asks for five: 400 and 500 for text,
 * 600 for most of what is emphasised, 700 for a title and 800 for a figure.
 * Without 600 and 800 the browser resolved both to Bold, so three quarters of
 * the interface was drawn at one weight.
 *
 * Not preloaded and in its own module, both for the same reason: the home
 * page preloaded these weights (226 KB) without using any of them, and
 * that delayed its main image. With Turbopack the font manifest lists EVERY
 * font of the project on each page — not those of the layout that imports
 * them — so splitting the module is not enough: only `preload: false` takes a
 * font out of the preload. The cost is that the platform downloads it when
 * its CSS asks for it instead of from the <head> (a few hundred ms the first
 * time; `swap` paints the text meanwhile).
 *
 * Apple's original .otf files (2.2 MB each) are not in the repo: download
 * them from developer.apple.com/fonts or recover them from the history
 * (commit 26d6ee1, public/design-import/fonts). These are woff2 subsets cut
 * down to Latin, punctuation, arrows and the check mark (~40 KB per weight).
 * To regenerate them:
 *
 *   pyftsubset SF-Pro-Display-Semibold.otf \
 *     --output-file=public/fonts/sf-pro-display-semibold.woff2 --flavor=woff2 \
 *     --layout-features='*' \
 *     --unicodes='U+0000-00FF,U+0100-017F,U+2000-206F,U+20AC,U+2190-2193,U+2713,U+FEFF'
 */
export const sfProDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/sf-pro-display-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/sf-pro-display-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/sf-pro-display-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/sf-pro-display-bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/sf-pro-display-heavy.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
  display: "swap",
  preload: false,
});

/**
 * The titles' font. Poppins, under the SIL Open Font License 1.1, whose text
 * travels with the subsets (`public/fonts/poppins-OFL.txt`): the sources are
 * Google Fonts' (github.com/google/fonts/tree/main/ofl/poppins) and the
 * subsets are cut with the same `pyftsubset` line as SF Pro's.
 *
 * Two weights, which are the ones the pages' titles ask for: 700, and 800
 * for the two that are drawn heavier. It is not preloaded either — a title is
 * painted with `swap` while it arrives, which is the same trade SF Pro makes.
 */
export const poppins = localFont({
  src: [
    {
      path: "../../public/fonts/poppins-bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/poppins-extrabold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});
