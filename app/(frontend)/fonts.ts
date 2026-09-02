import localFont from "next/font/local";

export const gramatika = localFont({
  src: [
    {
      path: "../../public/design-import/assets/fonts/gramatikabold.woff",
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
 * Tipografía de la plataforma autenticada. La web pública sigue con Gramatika
 * y Suisse Intl; aquí manda SF Pro Display para display Y para texto.
 *
 * Los .otf originales de Apple viven en public/design-import/fonts y pesan
 * 2,2 MB cada uno: no se sirven. Estos son subconjuntos woff2 recortados a
 * latín, puntuación, flechas y el visto (~40 KB por peso). Para regenerarlos:
 *
 *   pyftsubset SF-Pro-Display-Regular.otf \
 *     --output-file=assets/fonts/sf-pro-display-regular.woff2 --flavor=woff2 \
 *     --layout-features='*' \
 *     --unicodes='U+0000-00FF,U+0100-017F,U+2000-206F,U+20AC,U+2190-2193,U+2713,U+FEFF'
 */
export const sfProDisplay = localFont({
  src: [
    {
      path: "../../public/design-import/assets/fonts/sf-pro-display-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/design-import/assets/fonts/sf-pro-display-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/design-import/assets/fonts/sf-pro-display-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
  display: "swap",
});

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
});
