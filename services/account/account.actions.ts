"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { PLAY_ENABLED } from "@/constants/platform/features.const";
import { THEME_COOKIE_MAX_AGE, THEME_COOKIE_NAME, themeOf } from "@/constants/platform/theme.const";
import { isValidUserSlug, USER_SLUG_MAX } from "@/constants/platform/user-slug.const";
import { federationName } from "@/lib/chess/federations";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { formOptionalText, parseForm } from "@/services/shared/form-schema";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";
import { readReturnTo, safeReturnTo, withErrorParam } from "@/services/shared/safe-return-to";

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

const SLUG_SCHEMA = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(USER_SLUG_MAX)
    .refine((slug) => isValidUserSlug(slug)),
});

const DETAILS_SCHEMA = z.object({
  statusLine: formOptionalText(120),
  // A FIDE federation code, or the empty option: no flag.
  country: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((code) => (code ? code : null))
    .refine((code) => code === null || federationName(code) !== null),
});

/**
 * The person's user name: the address of their profile, `/perfil/<slug>`.
 * The same rule as the CHECK `user_slug_format` and `isValidUserSlug`, plus
 * the reserved words. The old address stops working; nothing redirects it.
 */
export async function setUserSlug(formData: FormData): Promise<void> {
  if (!PLAY_ENABLED) notFound();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:slug`, 5, 60_000)))
    redirect(withErrorParam(platformRoutes.settings, "throttled"));

  const form = parseForm(SLUG_SCHEMA, formData);
  if (!form.ok) redirect(withErrorParam(platformRoutes.settings, "slugInvalid"));

  try {
    await getPlatformDb().user.update({ where: { id: user.id }, data: { slug: form.data.slug } });
  } catch (error) {
    if (isUniqueConstraintError(error, "User_slug_key", "slug"))
      redirect(withErrorParam(platformRoutes.settings, "slugTaken"));
    throw error;
  }

  revalidatePath(platformRoutes.settings);
  revalidatePath(platformRoutes.profile, "layout");
  redirect(platformRoutes.settings);
}

/** The line and the flag the person's profile shows; both optional. */
export async function setProfileDetails(formData: FormData): Promise<void> {
  if (!PLAY_ENABLED) notFound();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:profile-details`, 10, 60_000)))
    redirect(withErrorParam(platformRoutes.settings, "throttled"));

  const form = parseForm(DETAILS_SCHEMA, formData);
  if (!form.ok) redirect(withErrorParam(platformRoutes.settings, "invalid"));

  await getPlatformDb().user.update({
    where: { id: user.id },
    data: { statusLine: form.data.statusLine, country: form.data.country },
  });

  revalidatePath(platformRoutes.settings);
  revalidatePath(platformRoutes.profile, "layout");
  redirect(platformRoutes.settings);
}
