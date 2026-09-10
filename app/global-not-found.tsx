import type { Metadata } from "next";
import Link from "next/link";
import { SiteMessage } from "@/components/site/sections/shell/site-message/site-message.section";
import "./(frontend)/globals.css";
import { gramatika, suisseIntl } from "./(frontend)/fonts";

// 404 for URLs that match NO route at all (`/whatever`). With three root
// layouts (site, platform and login) Next cannot compose it from a
// `not-found.tsx` and serves it bypassing the layouts, so this file brings
// its own <html> and <body>, the global sheet and the site's fonts. The
// `notFound()` calls inside the site (an article or a mentor that does not
// exist) keep using app/(frontend)/not-found.tsx, with header and footer.
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
