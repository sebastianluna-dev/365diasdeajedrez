import localFont from "next/font/local";

/**
 * Tipografía de la plataforma autenticada. La web pública sigue con Gramatika
 * y Suisse Intl (app/(frontend)/fonts.ts); aquí manda SF Pro Display para
 * display Y para texto.
 *
 * Sin precarga y en su propio módulo, las dos cosas por lo mismo: la portada
 * precargaba estos tres pesos (130 KB) sin usar ninguno y eso retrasaba su
 * imagen principal. Con Turbopack el manifiesto de fuentes lista TODAS las
 * fuentes del proyecto en cada página —no las del layout que las importa—,
 * así que separar el módulo no basta: sólo `preload: false` saca una fuente
 * de la precarga. El coste es que la plataforma la descarga cuando su CSS la
 * pide en vez de desde el <head> (unos cientos de ms la primera vez; `swap`
 * pinta el texto mientras tanto).
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
  preload: false,
});
