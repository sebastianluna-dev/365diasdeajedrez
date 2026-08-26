import { revalidatePath } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";

export const revalidateHome: GlobalAfterChangeHook = () => {
  revalidatePath("/");
};
