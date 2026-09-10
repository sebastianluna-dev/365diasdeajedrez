import type { MetadataRoute } from "next";
import { LOGIN_PATH, PROTECTED_PATH_PREFIXES, SESSION_ENTRY_PATH } from "@/constants/platform/auth.const";
import { SITE_URL } from "@/lib/site-url";

// Zonas privadas: la plataforma autenticada sale de la misma constante que usa
// el proxy —así una ruta nueva no puede quedar rastreable por olvido—, más su
// login y su puerta de entrada, el panel de Payload y la API.
const DISALLOWED_PATHS = [...PROTECTED_PATH_PREFIXES, LOGIN_PATH, SESSION_ENTRY_PATH, "/admin", "/api"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOWED_PATHS,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
