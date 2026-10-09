import { RESERVED_SLUGS, USER_SLUG_FALLBACK, USER_SLUG_MAX, USER_SLUG_MIN } from "@/constants/platform/user-slug.const";

// The user name a new account is proposed: the address of its profile,
// `/perfil/<slug>`, which the person can change in «Ajustes» (`setUserSlug`).
//
// Without "server-only": the seed and `npm run user:create` run outside Next
// and propose one too. Whoever creates an account calls `proposeUserSlug`
// BEFORE the `create` and passes the slug in its data — the column is NOT NULL.

/**
 * The letters a name's accents fold to. The migration that brought the column
 * backfilled the existing accounts with the same table (`translate()` in
 * `…_user_slug/migration.sql`), and the test keeps the two strings equal.
 */
export const SLUG_FOLD_FROM = "áàäâãåéèëêíìïîóòöôõúùüûñçý";
export const SLUG_FOLD_TO = "aaaaaaeeeeiiiiooooouuuuncy";

const FOLD = new Map([...SLUG_FOLD_FROM].map((char, index) => [char, SLUG_FOLD_TO[index]!]));

/**
 * A user name from a display name: lower case, accents folded, every run of
 * anything else turned into one dash, at most thirty characters. «Ana
 * Pérez» → `ana-perez`. A name that leaves fewer than three characters gives
 * `usuario`.
 */
export function userSlugFrom(displayName: string): string {
  const folded = [...displayName.toLowerCase()].map((char) => FOLD.get(char) ?? char).join("");
  const slug = folded
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, USER_SLUG_MAX)
    .replace(/-+$/, "");
  return slug.length >= USER_SLUG_MIN ? slug : USER_SLUG_FALLBACK;
}

/** `base` with a numeric suffix, still within thirty characters: `ana-perez-2`. */
export function withSuffix(base: string, n: number): string {
  const suffix = `-${n}`;
  return `${base.slice(0, USER_SLUG_MAX - suffix.length).replace(/-+$/, "")}${suffix}`;
}

/** The minimum of Prisma this needs, so a transaction serves too. */
export interface UserSlugReader {
  user: { findMany(args: unknown): Promise<{ slug: string }[]> };
}

/**
 * A free user name for a new account: the name's own, or with `-2`, `-3`…
 * when it is taken or reserved. Two accounts created at the same instant can
 * still collide; the unique index `User_slug_key` refuses the second, as it
 * would refuse a repeated email.
 */
export async function proposeUserSlug(db: UserSlugReader, displayName: string): Promise<string> {
  const base = userSlugFrom(displayName);
  const prefix = base.slice(0, USER_SLUG_MAX - 4);
  const taken = new Set(
    (await db.user.findMany({ where: { slug: { startsWith: prefix } }, select: { slug: true } })).map(
      (row) => row.slug,
    ),
  );
  const free = (slug: string) => !taken.has(slug) && !RESERVED_SLUGS.has(slug);
  if (free(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = withSuffix(base, n);
    if (free(candidate)) return candidate;
  }
}
