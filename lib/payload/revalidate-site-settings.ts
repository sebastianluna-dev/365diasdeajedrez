import { revalidatePath } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";

// Site settings (WhatsApp contact) render in the Footer, which is shared across
// every (frontend) page, so revalidate at the "layout" level like the header.
export const revalidateSiteSettings: GlobalAfterChangeHook = () => {
  revalidatePath("/", "layout");
};
