import type { SiteConfig } from "@/types/site-config.types";

export const siteConfig: SiteConfig = {
  home: {
    enabled: true,
    sections: {
      hero: true,
      program: true,
      teacher: true,
      mentors: false,
      plans: true,
      resources: false,
      reviews: true,
      faq: true,
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
  teachersShell: {
    nav: [
      { label: "Cómo funciona", href: "/para-profesores#como-funciona" },
      { label: "Qué incluye", href: "/para-profesores#incluye" },
      { label: "Preguntas", href: "/para-profesores#preguntas" },
    ],
    headerCta: {
      label: "Agenda una demo",
      message: "Hola, soy profesor de ajedrez y quiero agendar una demo de Plataforma Ajedrez 365.",
    },
    footerNav: [
      { label: "La academia 365 días de ajedrez", href: "/" },
      { label: "Cómo funciona", href: "/para-profesores#como-funciona" },
      { label: "Preguntas", href: "/para-profesores#preguntas" },
      { label: "Blog", href: "/blog" },
    ],
  },
};

/**
 * `teacher` and `mentors` occupy the same slot in Home, so at most
 * one of them can be shown at a time. `teacher` wins if both are
 * enabled by mistake.
 */
export type HomeMentorsSlot = "teacher" | "mentors" | null;

export function getHomeMentorsSlot(): HomeMentorsSlot {
  const { teacher, mentors } = siteConfig.home.sections;

  if (teacher && mentors && process.env.NODE_ENV !== "production") {
    console.warn(
      "[siteConfig] `teacher` y `mentors` están activos a la vez; solo se mostrará `teacher`. Desactiva uno de los dos en config/site.config.ts.",
    );
  }

  if (teacher) return "teacher";
  if (mentors) return "mentors";
  return null;
}
