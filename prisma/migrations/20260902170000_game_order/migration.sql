-- Manual order of the games within a study.
--
-- The backfill reproduces EXACTLY the order they were being shown in
-- (`playedAt` DESC, `createdAt` ASC) so that on deploy nothing gets reordered in
-- anyone's view. Mind the nulls: in PostgreSQL a DESC puts them first, and that
-- is how they were being listed.
ALTER TABLE "Game" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

WITH ordered AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "databaseId"
      ORDER BY "playedAt" DESC, "createdAt" ASC
    ) AS position
  FROM "Game"
)
UPDATE "Game" AS g
SET "order" = ordered.position
FROM ordered
WHERE g."id" = ordered."id";
