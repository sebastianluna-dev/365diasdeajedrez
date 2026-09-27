"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SOURCE_ENTITY_KIND_CODES } from "@/constants/platform/source-codes.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { syncCatalogJoin } from "@/services/shared/catalog-join.service";
import { formCodeList, formOptionalText, formOptionalUrl, formText, parseForm } from "@/services/shared/form-schema";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";

// "Procedencia del recurso". Rules that are not negotiable:
// - Every action opens with requireStaff() (they are reachable by direct POST).
// - Catalogs are connected by `code`, never by id.
// - Entities are never deleted from the interface: a source keeps pointing at
//   what it cited.

const NAME_MAX_LENGTH = 160;
const DESCRIPTION_MAX_LENGTH = 1000;

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
