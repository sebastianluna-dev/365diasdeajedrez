import type { TextField } from "payload";
import { generateSlug } from "@/lib/payload/generate-slug";

/**
 * A `slug` text field that auto-generates from `sourceFieldName` (e.g. "title")
 * ONLY the first time it's saved with an empty value. Once a slug exists, editing
 * the source field never touches it again — so publishing never silently breaks
 * an existing URL. Uniqueness is enforced by suffixing `-2`, `-3`, etc. on collision.
 */
export function slugField(sourceFieldName: string): TextField {
  return {
    name: "slug",
    type: "text",
    unique: true,
    index: true,
    admin: {
      position: "sidebar",
      description: "Se genera solo del título. Cambiarlo mueve la URL pública — hazlo con cuidado.",
    },
    hooks: {
      beforeValidate: [
        async ({ value, siblingData, originalDoc, collection, req }) => {
          if (value) return value;

          const source = (siblingData as Record<string, unknown>)[sourceFieldName];
          if (typeof source !== "string" || !source.trim()) return value;

          const base = generateSlug(source);
          if (!base || !collection) return base;

          let candidate = base;

          for (let suffix = 2; suffix <= 1000; suffix += 1) {
            const existing = await req.payload.find({
              collection: collection.slug,
              where: {
                slug: { equals: candidate },
                ...(originalDoc?.id ? { id: { not_equals: originalDoc.id } } : {}),
              },
              limit: 1,
              depth: 0,
            });

            if (existing.totalDocs === 0) break;
            candidate = `${base}-${suffix}`;
          }

          return candidate;
        },
      ],
    },
  };
}
