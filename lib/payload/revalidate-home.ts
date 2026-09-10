import { revalidatePath, revalidateTag } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";
import { CACHE_TAGS } from "@/lib/payload/cache-tags";

// First the cached data expires (unstable_cache in services/home) and then the
// route. `{ expire: 0 }` is the way to expire instantly from a route handler
// — these hooks run inside Payload's API —; with "max" the editor would see
// the old version once more after saving.
export const revalidateHome: GlobalAfterChangeHook = () => {
  revalidateTag(CACHE_TAGS.home, { expire: 0 });
  revalidatePath("/");
};
