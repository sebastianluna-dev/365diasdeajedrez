import { revalidatePath, revalidateTag } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";
import { CACHE_TAGS } from "@/lib/payload/cache-tags";

// The header renders on every (frontend) page via its shared layout, not just "/".
// Revalidating at the "layout" level invalidates that whole route group at once.
// The cached data goes first (see revalidate-home.ts for why `expire: 0`).
export const revalidateHeader: GlobalAfterChangeHook = () => {
  revalidateTag(CACHE_TAGS.header, { expire: 0 });
  revalidatePath("/", "layout");
};
