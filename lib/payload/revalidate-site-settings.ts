import { revalidatePath, revalidateTag } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";
import { CACHE_TAGS } from "@/lib/payload/cache-tags";

// Site settings (WhatsApp contact) render in the Footer, which is shared across
// every (frontend) page, so revalidate at the "layout" level like the header.
// The cached data goes first (see revalidate-home.ts for why `expire: 0`).
export const revalidateSiteSettings: GlobalAfterChangeHook = () => {
  revalidateTag(CACHE_TAGS.siteSettings, { expire: 0 });
  revalidatePath("/", "layout");
};
