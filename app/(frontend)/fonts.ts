import localFont from "next/font/local";

// Fuentes de la web pública. La de la plataforma (SF Pro Display) está en
// app/(platform)/fonts.ts, y allí se explica por qué va sin precarga: con
// Turbopack, todo lo que se precarga se precarga en TODAS las páginas.

/**
 * Subconjunto woff2 (latín, puntuación, flechas y el visto) hecho con el mismo
 * recorte que las SF Pro:
 *
 *   pyftsubset gramatikabold.woff --flavor=woff2 \
 *     --output-file=gramatikabold.woff2 --layout-features='*' \
 *     --unicodes='U+0000-00FF,U+0100-017F,U+2000-206F,U+20AC,U+2190-2193,U+2713,U+FEFF'
 */
export const gramatika = localFont({
  src: [
    {
      path: "../../public/design-import/assets/fonts/gramatikabold.woff2",
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
      path: "../../public/design-import/assets/fonts/suisseintl-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/design-import/assets/fonts/suisseintl-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/design-import/assets/fonts/suisseintl-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-suisse",
  display: "swap",
});

/**
 * Glifos de piezas. Sin precarga: 68 KB que sólo hacen falta cuando aparece
 * notación en pantalla, nunca arriba del pliegue. Al no precargarse, el
 * navegador la descarga cuando algo la usa (y `swap` no bloquea el texto).
 */
export const chessGlyph = localFont({
  src: [
    {
      path: "../../public/design-import/assets/fonts/chessglyph.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-chessglyph",
  display: "swap",
  preload: false,
});
