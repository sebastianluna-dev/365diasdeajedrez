import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import LandingPage from "./landing-page";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Portada estática: se prerenderiza en el build y se sirve desde la CDN. Quien
// ya entró no la ve: `proxy.ts` manda a /entrar a quien traiga cookie de
// sesión, y ese route handler reparte por rol (o borra la cookie caducada y
// devuelve aquí). Por eso esta página no puede leer cookies ni cabeceras: en
// cuanto lo hiciera volvería a renderizarse por petición.
//
// Los hooks `afterChange` de los Globals la regeneran al guardar en el CMS
// (revalidatePath); el plazo de una hora es la red de seguridad para cambios
// que no pasen por Payload, la misma que en services/home/home.service.ts.
export const revalidate = 3600;

export default function HomePage() {
  if (!siteConfig.home.enabled) notFound();

  return <LandingPage />;
}
