import { revalidatePath, revalidateTag } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";
import { CACHE_TAGS } from "@/lib/payload/cache-tags";

// Primero caducan los datos cacheados (unstable_cache en services/home) y
// después la ruta. `{ expire: 0 }` es la forma de caducar al instante desde un
// route handler —estos hooks corren dentro de la API de Payload—; con "max" el
// editor vería una vez más la versión vieja tras guardar.
export const revalidateHome: GlobalAfterChangeHook = () => {
  revalidateTag(CACHE_TAGS.home, { expire: 0 });
  revalidatePath("/");
};
