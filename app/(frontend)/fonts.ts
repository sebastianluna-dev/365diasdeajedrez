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
