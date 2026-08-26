import { cache } from "react";
import { getPayload } from "@/lib/payload/get-payload";
import type { SiteSettingsContent } from "./site-settings.types";

const getSiteSettingsGlobal = cache(async () => {
  const payload = await getPayload();
  return payload.findGlobal({ slug: "site-settings" });
});

export async function getSiteSettingsData(): Promise<SiteSettingsContent> {
  const settings = await getSiteSettingsGlobal();
  return {
    whatsappNumber: `${settings.whatsappCountryCode}${settings.whatsappLocalNumber}`,
    whatsappDefaultMessage: settings.whatsappDefaultMessage,
  };
}
