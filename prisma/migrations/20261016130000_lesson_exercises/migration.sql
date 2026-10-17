-- Exercises, phase 2 (2026-10-16): a lesson's exercises live in "Exercise",
-- the bank's table, with the lesson as owner (D04, D05, D41; PLAN.md §2.5).
--
-- What changes in the model:
--
--   - "Exercise"."lessonId" and "lessonOrder": set, the row is the lesson's
--     exercise — authored by the staff with the same editor and the same
--     format, never in a bank, a series or the library. Two CHECKs: an
--     exercise has at most one owner (exercise_single_owner) and an order
--     only inside a lesson (exercise_lesson_order_needs_lesson); the order is
--     unique per lesson.
--   - "TrainingAttempt"."isLegacy": set here only, on the attempts moved
--     below, so rebuildUserExerciseState folds them as this migration did.
--
-- What moves: every hand-made "TrainingExercise" (NOT "isDerived") becomes an
-- "Exercise" with the SAME id, so "UserActivity"."subjectId" (polymorphic,
-- append-only) and the attempts keep pointing at the right thing. The derived
-- line drills stay where they are, for the dormant Move Trainer. The SQL
-- computes what the writers would (exerciseSolutionColumns: the PGN from the
-- frozen line, the start's hash, the plies and the player's moves; the status
-- PUBLISHED a lesson exercise is served with), and says so at each step.
-- prisma/exercise-migration.test.ts reads this file. See prisma/schema.prisma
-- and docs/ → Platform → Data model.

-- 1. The columns, as Prisma's diff writes them.
ALTER TABLE "Exercise" ADD COLUMN     "lessonId" TEXT,
ADD COLUMN     "lessonOrder" INTEGER;

ALTER TABLE "TrainingAttempt" ADD COLUMN     "isLegacy" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "Exercise_lessonId_lessonOrder_key" ON "Exercise"("lessonId", "lessonOrder");

ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The rules Prisma cannot express: one owner at most, and an order only
-- inside a lesson (an archived lesson exercise keeps its lesson and loses
-- its order).
ALTER TABLE "Exercise" ADD CONSTRAINT "exercise_single_owner" CHECK (NOT ("teacherId" IS NOT NULL AND "lessonId" IS NOT NULL));
ALTER TABLE "Exercise" ADD CONSTRAINT "exercise_lesson_order_needs_lesson" CHECK ("lessonOrder" IS NULL OR "lessonId" IS NOT NULL);

-- 2. Every hand-made TrainingExercise becomes an Exercise with the SAME id.
--    - kind SEQUENCE (D01: a one-move exercise is a sequence of one); status
--      PUBLISHED, as a lesson exercise is served (PLAN.md §8, the lesson row);
--    - the title is the lesson's name, numbered when the lesson had several;
--    - the difficulty is the easiest level of the course (its eloMin), else
--      1200, kept inside exercise_difficulty_range;
--    - the solution PGN is the frozen line over the frozen start, as
--      lib/chess/exercise-format.ts `solutionPgnFromLine` writes it but
--      unnumbered (chessops reads it; the editor's first save renumbers it).
--      FIND_MOVE kept only its first SAN, which is where the trainer stopped;
--      REPRODUCE_LINE keeps the whole line;
--    - startPositionHash = createPositionHash(startFen): the sha256 of the
--      first four FEN fields (normalizePositionFen), in hex;
--    - solutionPlies counts the line's SANs; playerMoves = ceil(plies / 2),
--      the player moving first (readSolutionStart).
INSERT INTO "Exercise" ("id", "kindId", "statusId", "title", "prompt", "difficulty", "hints", "solutionPgn", "startFen",
  "startPositionHash", "solutionPlies", "playerMoves", "lessonId", "lessonOrder", "createdAt", "updatedAt")
SELECT te."id",
  (SELECT "id" FROM "ExerciseKind" WHERE "code" = 'SEQUENCE'),
  (SELECT "id" FROM "ExerciseStatus" WHERE "code" = 'PUBLISHED'),
  left(CASE WHEN n.cnt > 1 THEN l."name" || ' · ' || te."order" ELSE l."name" END, 120),
  left(te."promptText", 200),
  LEAST(3000, GREATEST(400, COALESCE((SELECT min(lv."eloMin") FROM "CourseLevel" cl JOIN "Level" lv ON lv."id" = cl."levelId"
                                      WHERE cl."courseId" = ch."courseId"), 1200))),
  '{}',
  '[SetUp "1"]' || E'\n' || '[FEN "' || te."startFen" || '"]' || E'\n\n' ||
    (CASE m."code" WHEN 'FIND_MOVE' THEN split_part(trim(te."line"), ' ', 1) ELSE trim(te."line") END) || ' *',
  te."startFen",
  encode(sha256(convert_to(array_to_string((string_to_array(te."startFen", ' '))[1:4], ' '), 'UTF8')), 'hex'),
  p.plies, (p.plies + 1) / 2,
  te."lessonId", te."order", now(), now()
FROM "TrainingExercise" te
JOIN "ExerciseMode" m ON m."id" = te."modeId"
JOIN "Lesson" l ON l."id" = te."lessonId"
JOIN "Chapter" ch ON ch."id" = l."chapterId"
JOIN LATERAL (SELECT count(*) AS cnt FROM "TrainingExercise" x WHERE x."lessonId" = te."lessonId" AND NOT x."isDerived") n ON true
JOIN LATERAL (SELECT CASE m."code" WHEN 'FIND_MOVE' THEN 1
              ELSE array_length(string_to_array(trim(te."line"), ' '), 1) END AS plies) p ON true
WHERE NOT te."isDerived";

-- Its topics are the lesson's (syncCatalogJoin would write the same join).
INSERT INTO "ExerciseTopic" ("exerciseId", "topicId")
SELECT te."id", lt."topicId"
FROM "TrainingExercise" te
JOIN "LessonTopic" lt ON lt."lessonId" = te."lessonId"
WHERE NOT te."isDerived";

-- 3. The attempts follow their exercise, marked legacy: recorded under the
--    trainer's rules, where PASSED allowed mistakes and nothing gated the day.
UPDATE "TrainingAttempt" SET "exerciseId" = "trainingExerciseId", "trainingExerciseId" = NULL, "isLegacy" = true
WHERE "trainingExerciseId" IN (SELECT "id" FROM "TrainingExercise" WHERE NOT "isDerived");

-- 4. The standing of each student with each moved exercise, as
--    recordExerciseAttempt would have left it without the day gate and the
--    review ladder (the review columns stay null: old attempts schedule
--    nothing). firstSolvedAt is the first PASSED attempt.
INSERT INTO "UserExerciseState" ("userId", "exerciseId", "attemptCount", "firstAttemptAt", "firstSolvedAt", "lastAttemptAt", "updatedAt")
SELECT a."userId", a."exerciseId", count(*), min(a."createdAt"),
       min(a."createdAt") FILTER (WHERE r."code" = 'PASSED'), max(a."createdAt"), now()
FROM "TrainingAttempt" a
JOIN "AttemptResult" r ON r."id" = a."resultId"
WHERE a."isLegacy" AND a."exerciseId" IS NOT NULL
GROUP BY a."userId", a."exerciseId";

UPDATE "UserExerciseState" s SET "lastResultId" = last."resultId"
FROM (SELECT DISTINCT ON (a."userId", a."exerciseId") a."userId", a."exerciseId", a."resultId"
      FROM "TrainingAttempt" a
      WHERE a."isLegacy" AND a."exerciseId" IS NOT NULL
      ORDER BY a."userId", a."exerciseId", a."createdAt" DESC, a."id" DESC) last
WHERE s."userId" = last."userId" AND s."exerciseId" = last."exerciseId";

-- 5. The moved rows leave TrainingExercise; the derived drills stay.
DELETE FROM "TrainingExercise" WHERE NOT "isDerived";
