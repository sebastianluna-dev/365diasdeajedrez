"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SOURCE_ENTITY_KIND_CODES, SOURCE_TYPE_CODES } from "@/constants/platform/source-codes.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { syncCatalogJoin } from "@/services/shared/catalog-join.service";
import {
  formCodeList,
  formLenientInt,
  formOptionalText,
  formOptionalUrl,
  formText,
  isCatalogCode,
  parseForm,
  readIds,
} from "@/services/shared/form-schema";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";
import { nextOrder } from "@/services/shared/reorder";

// "Procedencia del recurso". Rules that are not negotiable:
// - Every action opens with requireStaff() (they are reachable by direct POST).
// - Catalogs are connected by `code`, never by id.
// - Entities are never deleted from the interface: a source keeps pointing at
//   what it cited.

const NAME_MAX_LENGTH = 160;
const DESCRIPTION_MAX_LENGTH = 1000;
const TITLE_MAX_LENGTH = 300;
const AUTHORS_MAX_LENGTH = 300;
const EDITION_MAX_LENGTH = 80;
const REFERENCE_MAX_LENGTH = 500;
/** Nothing about chess in print predates this, and a year past the next century is a typo. */
const YEAR_MIN = 1400;
const YEAR_MAX = 2100;

/** The unique index over lower("name"), written by hand in the migration. */
const ENTITY_NAME_INDEX = "source_entity_name_ci";

function fail(path: string, code: string): never {
  redirect(`${path}?error=${code}`);
}

const ENTITY_SCHEMA = z.object({
  name: formText(NAME_MAX_LENGTH),
  // At least one: an entity that is nothing cannot be told apart from another.
  kindCodes: formCodeList(SOURCE_ENTITY_KIND_CODES, 1),
  website: formOptionalUrl(2000),
  description: formOptionalText(DESCRIPTION_MAX_LENGTH),
});

/** The failure code a bad entity form answers with: the one field with words of its own, or the generic one. */
function entityFormError(field: string): string {
  return field === "kindCodes" ? "entityKindRequired" : "invalid";
}

export async function createSourceEntity(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const path = staffRoutes.entities;
  if (!(await allowAction(`${staff.user.id}:entity-create`, 20, 3_600_000))) fail(path, "throttled");

  const parsed = parseForm(ENTITY_SCHEMA, formData);
  if (!parsed.ok) fail(path, entityFormError(parsed.field));
  const { name, kindCodes, website, description } = parsed.data;

  try {
    await getPlatformDb().sourceEntity.create({
      data: {
        name,
        website,
        description,
        kinds: { create: [...new Set(kindCodes)].map((code) => ({ kind: { connect: { code } } })) },
      },
      select: { id: true },
    });
  } catch (error) {
    if (isUniqueConstraintError(error, ENTITY_NAME_INDEX)) fail(path, "entityTaken");
    throw error;
  }

  revalidatePath(path);
}

export async function updateSourceEntity(entityId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const path = staffRoutes.entities;
  if (!(await allowAction(`${staff.user.id}:entity-update`, 60, 60_000))) fail(path, "throttled");

  const parsed = parseForm(ENTITY_SCHEMA, formData);
  if (!parsed.ok) fail(path, entityFormError(parsed.field));
  const { name, kindCodes, website, description } = parsed.data;
  const db = getPlatformDb();

  const existing = await db.sourceEntity.findUnique({ where: { id: entityId }, select: { id: true } });
  if (!existing) fail(path, "entityMissing");

  try {
    await db.$transaction(async (tx) => {
      await tx.sourceEntity.update({ where: { id: entityId }, data: { name, website, description } });
      // The kinds are a checkbox group: the whole set is replaced in the same
      // transaction so as not to leave a halfway state.
      await syncCatalogJoin(tx.sourceEntityKindLink, tx.sourceEntityKind, {
        parent: { entityId },
        catalogColumn: "kindId",
        codes: kindCodes,
      });
    });
  } catch (error) {
    if (isUniqueConstraintError(error, ENTITY_NAME_INDEX)) fail(path, "entityTaken");
    throw error;
  }

  revalidatePath(path);
}

// --- The sources of a course ----------------------------------------------

const SOURCE_SCHEMA = z.object({
  sourceTypeCode: formText(32).refine((value) => isCatalogCode(value, SOURCE_TYPE_CODES)),
  originalTitle: formOptionalText(TITLE_MAX_LENGTH),
  authors: formOptionalText(AUTHORS_MAX_LENGTH),
  // "" from the select's empty option becomes null: no entity.
  entityId: formOptionalText(64),
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
  const { sourceTypeCode, entityId, ...fields } = parsed.data;
  const db = getPlatformDb();

  const course = await db.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) fail(detailPath, "courseMissing");
  if (entityId) {
    const entity = await db.sourceEntity.findUnique({ where: { id: entityId }, select: { id: true } });
    if (!entity) fail(detailPath, "entityMissing");
  }

  const data = { ...fields, sourceType: { connect: { code: sourceTypeCode } } };
  const entity = entityId ? { connect: { id: entityId } } : undefined;

  if (sourceId) {
    // Scoped to the course: a forged id of another course's source touches nothing.
    const existing = await db.courseSource.findFirst({ where: { id: sourceId, courseId }, select: { id: true } });
    if (!existing) fail(detailPath, "sourceMissing");
    // Connect or clear: an edit that empties the select detaches the entity.
    await db.courseSource.update({
      where: { id: sourceId },
      data: { ...data, entity: entity ?? { disconnect: true } },
    });
  } else {
    const count = await db.courseSource.count({ where: { courseId } });
    await db.courseSource.create({
      data: { ...data, entity, course: { connect: { id: courseId } }, order: nextOrder(count) },
      select: { id: true },
    });
  }

  revalidatePath(detailPath);
}

export async function deleteCourseSource(courseId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.courseDetail(courseId);
  if (!(await allowAction(`${staff.user.id}:course-source`, 60, 60_000))) fail(detailPath, "throttled");

  const { sourceId } = readIds(formData, "sourceId");
  if (!sourceId) fail(detailPath, "invalid");

  // Scoped to the course, like the update: nothing of another course goes.
  const { count } = await getPlatformDb().courseSource.deleteMany({ where: { id: sourceId, courseId } });
  if (count === 0) fail(detailPath, "sourceMissing");

  revalidatePath(detailPath);
}
