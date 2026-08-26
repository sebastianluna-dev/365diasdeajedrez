import { getPayload } from "@/lib/payload/get-payload";
import { SiteHeaderClient } from "./site-header-client.comp";

export async function SiteHeader() {
  const payload = await getPayload();
  const header = await payload.findGlobal({ slug: "home-header" });

  return <SiteHeaderClient navItems={header.navItems ?? []} ctaLabel={header.ctaLabel} />;
}
