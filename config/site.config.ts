import type { SiteConfig } from "@/interfaces/site-config.interface";

export const siteConfig: SiteConfig = {
  home: {
    enabled: true,
    sections: {
      hero: true,
      program: true,
      mentors: true,
      plans: true,
      resources: true,
      reviews: true,
      faq: true,
    },
  },
};
