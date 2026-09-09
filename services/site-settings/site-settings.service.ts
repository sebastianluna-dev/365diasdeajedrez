import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CACHE_TAGS } from "@/lib/payload/cache-tags";
import { getPayload } from "@/lib/payload/get-payload";
import type { SiteSettingsContent } from "./site-settings.types";

// Cacheado entre peticiones igual que los Globals de la portada (ver el
// comentario en services/home/home.service.ts); lo caduca el hook del Global.
const readSiteSettingsGlobal = unstable_cache(
  async () => {
    const payload = await getPayload();
    return payload.findGlobal({ slug: "site-settings" });
  },
  ["site-settings"],
  { tags: [CACHE_TAGS.siteSettings], revalidate: 3600 },
);
const getSiteSettingsGlobal = cache(readSiteSettingsGlobal);

export async function getSiteSettingsData(): Promise<SiteSettingsContent> {
  const settings = await getSiteSettingsGlobal();
  return {
    whatsappNumber: `${settings.whatsappCountryCode}${settings.whatsappLocalNumber}`,
    whatsappDefaultMessage: settings.whatsappDefaultMessage,
  };
}
