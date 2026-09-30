-- `Chapter.estimatedDuration` stops being typed by hand and becomes the sum of
-- its lessons' minutes (`syncChapterDuration`). No DDL: the column already
-- exists and stays nullable. What changes is who owns it, so every row is
-- brought in line with the rule here, and a hand-typed figure that disagreed
-- with its lessons is overwritten — that figure is exactly what stops existing.
--
-- LEFT JOIN and not an inner one: a chapter with no lessons has to be emptied
-- too, and it is the case an inner join silently skips. SUM over no rows, or
-- over rows that are all NULL, is NULL, and NULLIF turns a real zero into NULL:
-- both mean "no lesson declares minutes", which is what the column's NULL says.
--
-- `IS DISTINCT FROM` compares the NULLs correctly and makes the statement
-- idempotent: running it again writes nothing, so the same expression serves as
-- the rebuild and as the drift audit.
UPDATE "Chapter" AS c
SET "estimatedDuration" = t."minutes"
FROM (
  SELECT
    ch."id",
    NULLIF(COALESCE(SUM(l."estimatedDuration"), 0), 0) AS "minutes"
  FROM "Chapter" ch
  LEFT JOIN "Lesson" l ON l."chapterId" = ch."id"
  GROUP BY ch."id"
) AS t
WHERE c."id" = t."id"
  AND c."estimatedDuration" IS DISTINCT FROM t."minutes";
