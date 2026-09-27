"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ELO_MAX } from "@/constants/platform/course-levels.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { isValidEloRange } from "@/services/courses/level-rules";
import { formCheckbox, formInt, formOptionalInt, formText, parseForm } from "@/services/shared/form-schema";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";

// The catalog of levels. Rules that are not negotiable:
// - Every action opens with requireStaff() (they are reachable by direct POST).
// - A level is never deleted: it is retired with `isActive`, and the courses
//   that had it keep their assignment.
// - The Elo range guides, it restricts nothing: no action of the platform
//   reads it to decide what a student may open.

const NAME_MAX_LENGTH = 80;
const SLUG_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 500;
const ORDER_MAX = 999;
const SLUG_SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(code: string): never {
  redirect(`${staffRoutes.levels}?error=${code}`);
}

const LEVEL_FIELDS = {
  name: formText(NAME_MAX_LENGTH),
  slug: z.string().trim().toLowerCase().max(SLUG_MAX_LENGTH).regex(SLUG_SHAPE),
  description: formText(DESCRIPTION_MAX_LENGTH),
  eloMin: formInt(0, ELO_MAX),
  // Empty = no upper bound. A typo fails instead of being read as "no bound".
  eloMax: formOptionalInt(0, ELO_MAX),
};

// A new level goes last unless it is told where: empty = after the others.
const LEVEL_CREATE_SCHEMA = z.object({ ...LEVEL_FIELDS, order: formOptionalInt(0, ORDER_MAX) });
const LEVEL_UPDATE_SCHEMA = z.object({ ...LEVEL_FIELDS, order: formInt(0, ORDER_MAX), isActive: formCheckbox() });

/** The failure code a bad level form answers with: the fields with words of their own, or the generic one. */
function levelFormError(field: string): string {
  if (field === "eloMin" || field === "eloMax") return "levelElo";
  if (field === "slug") return "levelSlugShape";
  return "invalid";
}

/** Everything that shows a level's name or range: the panel, the editors and the student's courses. */
function revalidateLevelPaths() {
  revalidatePath(staffRoutes.levels);
  revalidatePath(staffRoutes.courses, "layout");
  revalidatePath(platformRoutes.courses, "layout");
}

export async function createLevel(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:level-create`, 20, 3_600_000))) fail("throttled");

  const parsed = parseForm(LEVEL_CREATE_SCHEMA, formData);
  if (!parsed.ok) fail(levelFormError(parsed.field));
  const { order, ...fields } = parsed.data;
  if (!isValidEloRange(fields, ELO_MAX)) fail("levelElo");
  const db = getPlatformDb();

  let position = order;
  if (position === null) {
    const last = await db.level.aggregate({ _max: { order: true } });
    position = Math.min(ORDER_MAX, (last._max.order ?? 0) + 1);
  }

  try {
    await db.level.create({ data: { ...fields, order: position }, select: { id: true } });
  } catch (error) {
    if (isUniqueConstraintError(error, "Level_slug_key", "slug")) fail("levelSlug");
    throw error;
  }

  revalidateLevelPaths();
}

export async function updateLevel(levelId: number, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:level-update`, 60, 60_000))) fail("throttled");

  // The id is a bound argument, but the action is reachable by direct POST.
  if (!Number.isInteger(levelId) || levelId <= 0) fail("levelMissing");

  const parsed = parseForm(LEVEL_UPDATE_SCHEMA, formData);
  if (!parsed.ok) fail(levelFormError(parsed.field));
  if (!isValidEloRange(parsed.data, ELO_MAX)) fail("levelElo");
  const db = getPlatformDb();

  const existing = await db.level.findUnique({ where: { id: levelId }, select: { id: true } });
  if (!existing) fail("levelMissing");

  try {
    // Only the row is written: `CourseLevel` is not touched, so renaming,
    // moving or retiring a level never takes it from a course.
    await db.level.update({ where: { id: levelId }, data: parsed.data, select: { id: true } });
  } catch (error) {
    if (isUniqueConstraintError(error, "Level_slug_key", "slug")) fail("levelSlug");
    throw error;
  }

  revalidateLevelPaths();
}
