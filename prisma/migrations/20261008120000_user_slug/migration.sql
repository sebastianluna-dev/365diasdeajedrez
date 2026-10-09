-- A user name for every person: the address of their profile, /perfil/<slug>,
-- which they can change in «Ajustes». And two optional lines their profile
-- shows: a status they write and the flag of their federation.
--
-- The column comes in empty, is filled for the accounts that exist with the
-- rule a new account is proposed with (`userSlugFrom`,
-- services/shared/user-slug.service.ts: lower case, accents folded with the
-- same table, every run of anything else one dash, at most thirty characters,
-- `usuario` when fewer than three are left; `-2`, `-3`… for the repeated ones,
-- in the order the accounts were created), and only then becomes NOT NULL and
-- unique. No row of another table changes.

ALTER TABLE "User"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "statusLine" VARCHAR(120),
  ADD COLUMN "country" TEXT;

WITH "folded" AS (
  SELECT "id", "createdAt",
    rtrim(left(trim(BOTH '-' FROM regexp_replace(
      translate(lower("displayName"), 'áàäâãåéèëêíìïîóòöôõúùüûñçý', 'aaaaaaeeeeiiiiooooouuuuncy'),
      '[^a-z0-9]+', '-', 'g')), 30), '-') AS "base"
  FROM "User"
), "named" AS (
  SELECT "id", "createdAt", CASE WHEN char_length("base") >= 3 THEN "base" ELSE 'usuario' END AS "base"
  FROM "folded"
), "numbered" AS (
  SELECT "id", "base", row_number() OVER (PARTITION BY "base" ORDER BY "createdAt", "id") AS "n"
  FROM "named"
)
UPDATE "User" AS "user"
   SET "slug" = CASE
     WHEN "numbered"."n" = 1 THEN "numbered"."base"
     ELSE rtrim(left("numbered"."base", 30 - char_length('-' || "numbered"."n")), '-') || '-' || "numbered"."n"
   END
  FROM "numbered"
 WHERE "user"."id" = "numbered"."id";

ALTER TABLE "User" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- The same rule as USER_SLUG_PATTERN and its length (constants/platform/user-slug.const.ts).
ALTER TABLE "User" ADD CONSTRAINT "user_slug_format"
  CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length("slug") BETWEEN 3 AND 30);
