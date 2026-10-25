// A person's user name: the address of their profile, `/perfil/<slug>`.
// The same rule is written three times, and they say the same: here, in the
// zod schema of `setUserSlug`, and in the CHECK `user_slug_format` of the
// migration that brought the column.

/** Lower-case letters and digits, words joined by single dashes. */
export const USER_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const USER_SLUG_MIN = 3;
export const USER_SLUG_MAX = 30;

/** What a proposal falls back to when a name gives nothing usable. */
export const USER_SLUG_FALLBACK = "usuario";

/** Words of the platform's own addresses: nobody's user name. */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "admin",
  "administracion",
  "ajustes",
  "estadisticas",
  "estudios",
  "herramientas",
  "inicio",
  "jugar",
  "partidas",
  "perfil",
  "profesor",
  "staff",
]);

/** Whether a user name is well-formed and not reserved. */
export function isValidUserSlug(slug: string): boolean {
  return (
    slug.length >= USER_SLUG_MIN &&
    slug.length <= USER_SLUG_MAX &&
    USER_SLUG_PATTERN.test(slug) &&
    !RESERVED_SLUGS.has(slug)
  );
}
