-- Exercises, phase 2, a data fix (2026-10-16): 20261016130000_lesson_exercises
-- inserted the moved lesson exercises PUBLISHED without "publishedAt", which
-- the status writer (services/shared/exercise-status.service.ts) stamps on
-- every publication and keeps as the FIRST one. Those rows were served from
-- the day their course was published, so that is the date they get; a course
-- not published yet has none, and the row's own creation — the moment the
-- migration ran — is the next best; now() closes the COALESCE for a row that
-- somehow has neither. Only the moved rows are touched: a lesson's, PUBLISHED,
-- with no date. An applied migration is never edited, so this is a new one.
-- prisma/exercise-migration.test.ts reads this file.
UPDATE "Exercise" e
SET "publishedAt" = COALESCE(c."publishedAt", e."createdAt", now())
FROM "Lesson" l
JOIN "Chapter" ch ON ch."id" = l."chapterId"
JOIN "Course" c ON c."id" = ch."courseId"
WHERE e."lessonId" = l."id"
  AND e."lessonId" IS NOT NULL
  AND e."statusId" = (SELECT "id" FROM "ExerciseStatus" WHERE "code" = 'PUBLISHED')
  AND e."publishedAt" IS NULL;
