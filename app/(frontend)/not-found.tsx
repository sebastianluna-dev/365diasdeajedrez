import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/sections/common/header/header.section";
import { Footer } from "@/components/sections/common/footer/footer.section";
import { SiteMessage } from "@/components/sections/common/site-message/site-message.section";

export const metadata: Metadata = {
  title: "Página no encontrada | 365 Días de Ajedrez",
};

// El 404 del sitio público: con cabecera, pie y paleta propios. Sin este
// archivo, un enlace viejo a un artículo o a un mentor caía en la pantalla
// por defecto de Next, en inglés y sin nada del sitio alrededor.
export default function NotFound() {
  return (
    <>
      <Header />
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
      <Footer />
    </>
  );
}
