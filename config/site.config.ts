import { LOGIN_PATH } from "@/constants/platform/auth.const";
import type { SiteConfig } from "@/types/site-config.types";

export const siteConfig: SiteConfig = {
  home: {
    enabled: true,
    sections: {
      hero: true,
      // Shown only once every figure has a real value (config/academy-home.config.ts).
      figures: true,
      classes: true,
      team: true,
      courses: true,
      platform: true,
      adventure: true,
      information: true,
      testimonials: true,
      faq: true,
      closing: true,
    },
  },
  // The header and the footer of the site's new look (2026-10-26). They live
  // here and not in the CMS: their links point at the sections of the home
  // page, which are code, and the header's button says what its WhatsApp
  // message asks for — an editable label could promise something else. The
  // `home-header` Global, which fed the old header's links, is no longer read.
  shell: {
    nav: [
      { label: "Clases", href: "/#como-funciona" },
      { label: "Cursos", href: "/#cursos" },
      { label: "Plataforma", href: "/#plataforma" },
      { label: "Aventura", href: "/#aventura" },
      { label: "Información", href: "/#informacion" },
      { label: "Blog", href: "/blog" },
    ],
    headerCta: {
      label: "Agenda tu clase",
      message: "Hola, quiero información sobre las clases de ajedrez y agendar una clase de prueba.",
    },
    // The footer of the owner's «Cierre y pie B» (2026-10-26): three columns
    // of links, the contact, and the band to the teachers' landing.
    footerColumns: [
      {
        title: "Academia",
        links: [
          { label: "Clases", href: "/#como-funciona" },
          { label: "Cursos", href: "/#cursos" },
          { label: "Plataforma", href: "/#plataforma" },
          { label: "Aventura", href: "/#aventura" },
          { label: "Preguntas frecuentes", href: "/#preguntas" },
        ],
      },
      {
        title: "Recursos",
        links: [
          { label: "Blog", href: "/blog" },
          { label: "Reloj de ajedrez", href: "/reloj-de-ajedrez" },
        ],
      },
      {
        title: "La academia",
        links: [
          { label: "Nosotros", href: "/nosotros" },
          { label: "Iniciar sesión", href: LOGIN_PATH },
        ],
      },
    ],
    footerCrossLink: {
      question: "¿Eres maestro?",
      label: "Conoce Plataforma Ajedrez 365",
      // The teachers' landing (the «Plataforma Ajedrez 365» branch adds the route).
      href: "/para-profesores",
      note: "Cursos, ejercicios y clases para enseñar ajedrez.",
    },
    contactEmail: "contacto@365diasdeajedrez.com",
  },
};
