import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { chessGlyph, gramatika, suisseIntl } from "./fonts";
import { GoogleAnalytics } from "@/components/common/google-analytics.comp";
import { MetaPixel } from "@/components/common/meta-pixel.comp";
import { SITE_URL } from "@/lib/site-url";

// `metadataBase` es lo que permite que las canónicas y las imágenes Open Graph
// de cada página vayan como rutas relativas. La imagen OG por defecto la
// genera `opengraph-image.tsx` (este mismo segmento) y la heredan todas las
// páginas públicas que no declaren la suya, como hace el blog.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "365 Días de Ajedrez | Academia de ajedrez",
  description:
    "Academia de ajedrez en línea con un método progresivo, cursos personalizados y seguimiento para mejorar tu juego.",
  keywords: ["ajedrez", "academia", "entrenamiento", "clases de ajedrez"],
  openGraph: {
    siteName: "365 Días de Ajedrez",
    title: "365 Días de Ajedrez",
    description:
      "Un método progresivo para mejorar tu ajedrez con clases guiadas, seguimiento y recursos de estudio.",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${gramatika.variable} ${suisseIntl.variable} ${chessGlyph.variable}`}>
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        {children}
        <GoogleAnalytics />
        <MetaPixel />
        {/* Su script sólo existe en despliegues de Vercel; fuera de ahí (next start
            en local, otro hosting) daba un 404 en consola en cada visita. */}
        {process.env.VERCEL === "1" && <Analytics />}
      </body>
    </html>
  );
}
