"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SOURCE_TYPE_CODES } from "@/constants/platform/source-codes.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import {
  formLenientInt,
  formOptionalText,
  formOptionalUrl,
  formText,
  isCatalogCode,
  parseForm,
  readIds,
} from "@/services/shared/form-schema";
import { nextOrder } from "@/services/shared/reorder";
import { withErrorParam } from "@/services/shared/safe-return-to";

// "Procedencia del recurso". Rules that are not negotiable:
// - Every action opens with requireStaff() (they are reachable by direct POST).
// - Catalogs are connected by `code`, never by id.

const DESCRIPTION_MAX_LENGTH = 1000;
const TITLE_MAX_LENGTH = 300;
const AUTHORS_MAX_LENGTH = 300;
const EDITION_MAX_LENGTH = 80;
const REFERENCE_MAX_LENGTH = 500;
/** Nothing about chess in print predates this, and a year past the next century is a typo. */
const YEAR_MIN = 1400;
const YEAR_MAX = 2100;

function fail(path: string, code: string): never {
  redirect(withErrorParam(path, code));
}

const SOURCE_SCHEMA = z.object({
  sourceTypeCode: formText(32).refine((value) => isCatalogCode(value, SOURCE_TYPE_CODES)),
  originalTitle: formOptionalText(TITLE_MAX_LENGTH),
  authors: formOptionalText(AUTHORS_MAX_LENGTH),
  url: formOptionalUrl(2000),
  publicationYear: formLenientInt(YEAR_MIN, YEAR_MAX),
  edition: formOptionalText(EDITION_MAX_LENGTH),
  specificReference: formOptionalText(REFERENCE_MAX_LENGTH),
  notes: formOptionalText(DESCRIPTION_MAX_LENGTH),
});

/**
 * Creates a source of the course, or rewrites the one `sourceId` names. Only
 * the type is required: material of the academy's own making has nothing
 * else to say. A compilation is several calls, one per source.
 */
export async function saveCourseSource(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!(await allowAction(`${staff.user.id}:course-source`, 60, 60_000))) fail(detailPath, "throttled");

  const { sourceId } = readIds(formData, "sourceId");
  const parsed = parseForm(SOURCE_SCHEMA, formData);
  if (!parsed.ok) fail(detailPath, "invalid");
  const { sourceTypeCode, ...fields } = parsed.data;
  const db = getPlatformDb();

  const course = await db.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) fail(detailPath, "courseMissing");

  const data = { ...fields, sourceType: { connect: { code: sourceTypeCode } } };

  if (sourceId) {
    // Scoped to the course: a forged id of another course's source touches nothing.
    const existing = await db.courseSource.findFirst({ where: { id: sourceId, courseId }, select: { id: true } });
    if (!existing) fail(detailPath, "sourceMissing");
    await db.courseSource.update({ where: { id: sourceId }, data });
  } else {
    const count = await db.courseSource.count({ where: { courseId } });
    await db.courseSource.create({
      data: { ...data, course: { connect: { id: courseId } }, order: nextOrder(count) },
      select: { id: true },
    });
  }

  revalidatePath(detailPath);
}

/**
 * Deletes one source of the course. Both ids come bound from the source's
 * popup (`deleteCourseSource.bind(null, courseId, source.id)`), which is the
 * whole of what the confirmation's form has to say: it takes no `formData`.
 */
export async function deleteCourseSource(courseId: string, sourceId: string): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!(await allowAction(`${staff.user.id}:course-source`, 60, 60_000))) fail(detailPath, "throttled");

  if (!sourceId) fail(detailPath, "invalid");

  // Scoped to the course, like the update: nothing of another course goes.
  const { count } = await getPlatformDb().courseSource.deleteMany({ where: { id: sourceId, courseId } });
  if (count === 0) fail(detailPath, "sourceMissing");

  revalidatePath(detailPath);
}
