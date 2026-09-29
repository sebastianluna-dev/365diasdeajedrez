"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { THEME_COOKIE_MAX_AGE, THEME_COOKIE_NAME, themeOf } from "@/constants/platform/theme.const";
import { platformRoutes } from "@/lib/platform-routes";
import { readReturnTo, safeReturnTo } from "@/services/shared/safe-return-to";

/**
 * Sets the theme, or gives the choice back to the machine.
 *
 * A form and not a button with JavaScript, like the platform's other
 * preferences: the cookie is written and the page is drawn again in the other
 * theme, so there is no state to keep and nothing to send to the browser.
 * Which theme is asked for is bound into the action, so the form carries no
 * field that could be forged into something else.
 *
 * It is not gated on a session: what it writes is a cookie of the browser's,
 * it says nothing about anybody and it reads nothing.
 */
export async function setTheme(theme: "light" | "dark" | "system", formData: FormData): Promise<void> {
  const returnTo = safeReturnTo(readReturnTo(formData), platformRoutes.dashboard);
  const store = await cookies();

  if (theme === "system") {
    store.delete(THEME_COOKIE_NAME);
  } else {
    const chosen = themeOf(theme);
    if (chosen) {
      store.set(THEME_COOKIE_NAME, chosen, {
        maxAge: THEME_COOKIE_MAX_AGE,
        path: "/",
        sameSite: "lax",
        // No `httpOnly`: nothing here is a secret, and a later switch drawn in
        // the browser will want to read it.
      });
    }
  }

  // The theme is drawn by the platform's layout, which every page hangs from.
  revalidatePath("/", "layout");
  redirect(returnTo);
}
