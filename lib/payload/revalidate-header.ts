import { revalidatePath } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";

// The header renders on every (frontend) page via its shared layout, not just "/".
// Revalidating at the "layout" level invalidates that whole route group at once.
export const revalidateHeader: GlobalAfterChangeHook = () => {
  revalidatePath("/", "layout");
};
