export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The slug a record takes when its name loses focus: the one of the new name
 * if the name changed, the one it had otherwise. A name that yields no slug
 * ("¡¿?!") leaves the slug alone too, so the field is never emptied by a rename.
 */
export function slugAfterRename(previousName: string, nextName: string, currentSlug: string): string {
  if (nextName.trim() === previousName.trim()) return currentSlug;
  return generateSlug(nextName) || currentSlug;
}

/**
 * `base`, or `base-2`, `base-3`… the first one nobody has. For the slugs the
 * forms generate by themselves, where two records may share a name.
 */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
