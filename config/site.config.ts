import type { SiteConfig } from "@/interfaces/site-config.interface";

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
