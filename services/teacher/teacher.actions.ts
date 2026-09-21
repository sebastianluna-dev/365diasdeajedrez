"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isCommonTimezone } from "@/constants/platform/timezones.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { teacherRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { z } from "zod";
import { formOptionalText, formOptionalUrl, formText, parseForm } from "@/services/shared/form-schema";

// Server actions are reachable by direct POST: the role is ALWAYS resolved in
// here with requireTeacher() and an id from the client is never trusted. Errors
// come back by redirect with `?error=<code>`.

const PROFILE_SCHEMA = z.object({
  displayName: formText(120),
  title: formOptionalText(120),
  bio: formOptionalText(1000),
  // The photo is a text URL: the platform has no upload pipeline of its own
  // (Payload's belongs to the CMS and is not touched).
  photo: formOptionalUrl(500),
  timezone: z.string().trim().max(64).optional(),
});

export async function updateTeacherProfile(formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();

  const parsed = parseForm(PROFILE_SCHEMA, formData);
  if (!parsed.ok) redirect(`${teacherRoutes.profile}?error=${parsed.field === "displayName" ? "profile" : "invalid"}`);
  if (!(await allowAction(`${user.id}:teacher-profile`, 60, 60_000)))
    redirect(`${teacherRoutes.profile}?error=throttled`);

  const { displayName, title, bio, photo, timezone } = parsed.data;
  await getPlatformDb().teacher.update({
    where: { id: teacher.id },
    data: {
      displayName,
      title,
      bio,
      photo,
      timezone: timezone && isCommonTimezone(timezone) ? timezone : null,
    },
  });

  revalidatePath(teacherRoutes.profile);
  revalidatePath(teacherRoutes.home);
}
