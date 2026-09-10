import localFont from "next/font/local";

// Fuentes de la web pública. La de la plataforma (SF Pro Display) está en
// app/(platform)/fonts.ts, y allí se explica por qué va sin precarga: con
// Turbopack, todo lo que se precarga se precarga en TODAS las páginas.
//
// Los ficheros viven en public/fonts. next/font los lee en el build y los
// sirve con hash desde /_next/static/media, así que nada pide /fonts/* a mano.

/**
 * Subconjunto woff2 (latín, puntuación, flechas y el visto) hecho con el mismo
 * recorte que las SF Pro. El .woff original ya no está en el repo (queda en el
 * historial, bajo public/design-import/):
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
 * Glifos de piezas. Sin precarga: 68 KB que sólo hacen falta cuando aparece
 * notación en pantalla, nunca arriba del pliegue. Al no precargarse, el
 * navegador la descarga cuando algo la usa (y `swap` no bloquea el texto).
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
