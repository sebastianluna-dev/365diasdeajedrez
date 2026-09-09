import type { MetadataRoute } from "next";

// URL base del sitio; en local puede sobreescribirse con NEXT_PUBLIC_SITE_URL.
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://365diasdeajedrez.com";

// Zonas privadas: plataforma autenticada (alumno, profesor y administración),
// su login y su puerta de entrada, panel de Payload y API.
const DISALLOWED_PATHS = [
  "/inicio",
  "/clases",
  "/estudios",
  "/cursos",
  "/entrenador",
  "/explorador",
  "/profesor",
  "/administracion",
  "/iniciar-sesion",
  "/entrar",
  "/admin",
  "/api",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOWED_PATHS,
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
