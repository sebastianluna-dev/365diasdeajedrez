import localFont from "next/font/local";

// Fonts of the public site. The platform's (SF Pro Display) lives in
// app/(platform)/fonts.ts, which explains why it is not preloaded: with
// Turbopack, everything that is preloaded is preloaded on EVERY page.
//
// The files live in public/fonts. next/font reads them at build time and
// serves them hashed from /_next/static/media, so nothing requests /fonts/* by hand.

/**
 * woff2 subset (Latin, punctuation, arrows and the check mark) cut the same
 * way as the SF Pro files. The original .woff is no longer in the repo (it
 * remains in the history, under public/design-import/):
 *
 *   pyftsubset gramatikabold.woff --flavor=woff2 \
 *     --output-file=public/fonts/gramatika-bold.woff2 --layout-features='*' \
 *     --unicodes='U+0000-00FF,U+0100-017F,U+2000-206F,U+20AC,U+2190-2193,U+2713,U+FEFF'
 */
export const gramatika = localFont({
  src: [
    {
      path: "../../public/fonts/gramatika-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gramatika",
  display: "swap",
});

export const suisseIntl = localFont({
  src: [
    {
      path: "../../public/fonts/suisseintl-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/suisseintl-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/suisseintl-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-suisse",
  display: "swap",
});

/**
 * Piece glyphs. Not preloaded: 68 KB that are only needed when notation
 * appears on screen, never above the fold. Since it is not preloaded, the
 * browser downloads it when something uses it (and `swap` does not block the text).
 */
export const chessGlyph = localFont({
  src: [
    {
      path: "../../public/fonts/chessglyph.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-chessglyph",
  display: "swap",
  preload: false,
});

/**
 * The titles of the site's new look (Material 3 Expressive, «M4», 2026-10-26):
 * Poppins, as on the platform's moved pages, under the SIL Open Font License
 * 1.1 (`public/fonts/poppins-OFL.txt`). The platform's own definition
 * (app/(platform)/fonts.ts) carries only 600 and 700; the site's sections also
 * draw 500 (a card's title) and 800 (a course's cover), so the site declares
 * its own four weights over the same files. The two extra ones are Google
 * Fonts' Latin subset (`fonts.gstatic.com/s/poppins/v24`, the `/* latin *\/`
 * block of `css2?family=Poppins:wght@500;800`), which covers every accent and
 * the inverted marks Spanish asks for.
 *
 * Not preloaded, for the reason given above SF Pro's: with Turbopack a
 * preloaded font is preloaded on every page of the project, the platform's
 * included. The heading paints in the fallback with `swap` while it arrives.
 */
export const sitePoppins = localFont({
  src: [
    {
      path: "../../public/fonts/poppins-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/poppins-semibold.woff2",
      weight: "600",
      style: "normal",
    },
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
  variable: "--font-site-poppins",
  display: "swap",
  preload: false,
  fallback: ["Arial", "sans-serif"],
});
