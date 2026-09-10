import type { MetadataRoute } from "next";
import { LOGIN_PATH, PROTECTED_PATH_PREFIXES, SESSION_ENTRY_PATH } from "@/constants/platform/auth.const";
import { SITE_URL } from "@/lib/site-url";

// Private areas: the authenticated platform comes from the same constant the
// proxy uses — so a new route cannot end up crawlable by oversight — plus its
// login and its entry gate, the Payload panel and the API.
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
