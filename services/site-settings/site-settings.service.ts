import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CACHE_TAGS } from "@/lib/payload/cache-tags";
import { getPayload } from "@/lib/payload/get-payload";
import { buildWhatsappUrl } from "@/lib/build-whatsapp-url";
import type { SiteSettingsContent } from "./site-settings.types";

// Cached between requests just like the home page's Globals (see the comment in
// services/home/home.service.ts); the Global's hook expires it.
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

/**
 * The link that opens the academy's WhatsApp with `message` already written,
 * or with the CMS's default message when none is given. Every button of the
 * site that asks for something through WhatsApp builds its link here, so the
 * number is always the one `site-settings` holds.
 */
export async function getWhatsappHref(message?: string): Promise<string> {
  const { whatsappNumber, whatsappDefaultMessage } = await getSiteSettingsData();
  return buildWhatsappUrl(whatsappNumber, message ?? whatsappDefaultMessage);
}
