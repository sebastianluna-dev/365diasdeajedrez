"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isCommonTimezone } from "@/constants/platform/timezones.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { teacherRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { readOptionalText, readText, readUrl } from "@/services/shared/form-data";

// Las server actions son alcanzables por POST directo: el rol se resuelve
// SIEMPRE aquí dentro con requireTeacher() y nunca se confía en un id del
// cliente. Los errores vuelven por redirect con `?error=<code>`.

const DISPLAY_NAME_MAX_LENGTH = 120;
const TITLE_MAX_LENGTH = 120;
const BIO_MAX_LENGTH = 1000;

export async function updateTeacherProfile(formData: FormData): Promise<void> {
  const { teacher, user } = await requireTeacher();

  const displayName = readText(formData, "displayName");
  if (displayName.length === 0) redirect(`${teacherRoutes.profile}?error=profile`);
  if (!allowAction(`${user.id}:teacher-profile`, 60, 60_000)) redirect(`${teacherRoutes.profile}?error=throttled`);

  const timezone = readText(formData, "timezone");
  // La foto es una URL de texto: la plataforma no tiene pipeline de subida
  // propio (el de Payload es del CMS y no se toca).
  const photo = readOptionalText(formData, "photo", 500);
  if (photo !== null && readUrl(formData, "photo") === null) redirect(`${teacherRoutes.profile}?error=invalid`);

  await getPlatformDb().teacher.update({
    where: { id: teacher.id },
    data: {
      displayName: displayName.slice(0, DISPLAY_NAME_MAX_LENGTH),
      title: readOptionalText(formData, "title", TITLE_MAX_LENGTH),
      bio: readOptionalText(formData, "bio", BIO_MAX_LENGTH),
      photo,
      timezone: isCommonTimezone(timezone) ? timezone : null,
    },
  });

  revalidatePath(teacherRoutes.profile);
  revalidatePath(teacherRoutes.home);
}
