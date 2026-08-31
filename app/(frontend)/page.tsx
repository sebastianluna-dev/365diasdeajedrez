import { notFound, redirect } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/platform-auth/current-user";
import { getSessionRoles } from "@/lib/platform-auth/roles";
import { homeRouteFor } from "@/lib/platform-routes";
import LandingPage from "./landing-page";

export default async function HomePage() {
  if (!siteConfig.home.enabled) notFound();

  // Quien ya entró no vuelve a ver la portada comercial: se le manda a su área
  // según el rol (la misma regla que usan el menú y el destino del login).
  //
  // Las dos llamadas comparten la consulta de sesión —ambas están memorizadas
  // sobre `getSessionContext`—, así que esto cuesta UNA consulta. Lo que sí
  // cuesta es leer la cookie: la portada pasa de prerenderizada a renderizada
  // por petición. Es el precio de decidir en el servidor; a cambio, quien no
  // tiene sesión (el caso normal de una página de captación) ve exactamente lo
  // mismo que antes, sin parpadeo ni redirección en el cliente.
  const [user, roles] = await Promise.all([getSessionUser(), getSessionRoles()]);
  if (user) redirect(homeRouteFor(roles));

  return <LandingPage />;
}
