// Next Data Cache tags for what is read from the CMS.
//
// The services set them when caching with `unstable_cache` and the Globals'
// `afterChange` hooks expire them on save in Payload, so a change in the CMS is
// seen on the next visit without waiting for any deadline.
// Without "server-only": they are imported by Payload's hooks, which run inside
// its API and not inside a React render.

export const CACHE_TAGS = {
  /** The home page's seven Globals (hero, program, teacher, packages, FAQ, CTA, reviews). */
  home: "home-globals",
  /** The menu, which is rendered on every public page. */
  header: "home-header",
  /** Site settings (WhatsApp), in the footer and the CTA. */
  siteSettings: "site-settings",
  /** The list of published articles (blog, related ones and sitemap). */
  articles: "articles",
} as const;
