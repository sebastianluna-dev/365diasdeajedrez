import type { Metadata } from "next";
import Link from "next/link";
import { SiteMessage } from "@/components/sections/common/site-message/site-message.section";
import "./(frontend)/globals.css";
import { gramatika, suisseIntl } from "./(frontend)/fonts";

// 404 de las URLs que no encajan con NINGUNA ruta (`/lo-que-sea`). Con tres
// root layouts (sitio, plataforma y acceso) Next no puede componerlo desde un
// `not-found.tsx` y lo sirve saltándose los layouts, así que este archivo trae
// su propio <html> y <body>, la hoja global y las fuentes del sitio. Los
// `notFound()` de dentro del sitio (un artículo o un mentor que no existen)
// siguen usando app/(frontend)/not-found.tsx, con cabecera y pie.
export const metadata: Metadata = {
  title: "Página no encontrada | 365 Días de Ajedrez",
};

export default function GlobalNotFound() {
  return (
    <html lang="es" className={`${gramatika.variable} ${suisseIntl.variable}`}>
      <body>
        <main id="contenido">
          <SiteMessage
            eyebrow="Error 404"
            title="Esta página no existe"
            description="Puede que el enlace sea antiguo o que la dirección esté mal escrita."
          >
            <Link href="/" className="site-message__action">
              Volver a la portada
            </Link>
            <Link href="/blog" className="site-message__action site-message__action_variant_secondary">
              Ir al blog
            </Link>
          </SiteMessage>
        </main>
      </body>
    </html>
  );
}
