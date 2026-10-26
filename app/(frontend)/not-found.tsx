import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/sections/shell/site-header/site-header.section";
import { SiteFooter } from "@/components/site/sections/shell/site-footer/site-footer.section";
import { SiteMessage } from "@/components/site/sections/shell/site-message/site-message.section";

export const metadata: Metadata = {
  title: "Página no encontrada | 365 Días de Ajedrez",
};

// The public site's 404: with its own header, footer and palette. Without
// this file, an old link to an article or a mentor fell into Next's default
// screen, in English and with nothing of the site around it.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
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
      <SiteFooter />
    </>
  );
}
