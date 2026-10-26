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
    footerNav: [
      { label: "Clases", href: "/#como-funciona" },
      { label: "Aventura", href: "/#aventura" },
      { label: "Blog", href: "/blog" },
      { label: "Reloj de ajedrez", href: "/reloj-de-ajedrez" },
      { label: "Nosotros", href: "/nosotros" },
    ],
    contactEmail: "contacto@365diasdeajedrez.com",
  },
};
