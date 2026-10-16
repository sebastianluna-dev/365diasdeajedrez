-- Exercises, phase 1 (2026-10-16): the bank of authored exercises, its series
-- and the student's standing with each exercise; the attempts reuse
-- "TrainingAttempt" and "TrainingMistake".
--
-- What changes in the model:
--
--   - "Exercise": a starting position and a solution played on the board, with
--     variants and comments, kept as a PGN ("solutionPgn") plus the columns
--     frozen from it. Owned by a teacher ("teacherId") or by the academy
--     (null). Its topics are "ExerciseTopic".
--   - "ExerciseSeries" (an ordered set, "ExerciseSeriesItem") and
--     "ExerciseSeriesShare" (a teacher's series given to one student).
--   - "UserExerciseState": whether the student ever solved an exercise and
--     when it comes back for review, derived from the attempts.
--   - "TrainingAttempt"."exerciseId" pointed at the line trainer's
--     "TrainingExercise"; it is renamed "trainingExerciseId" and made nullable,
--     and a new "exerciseId" points at "Exercise". Exactly one is set. Every
--     existing row keeps its exercise: the rename moves no data.
--
-- Two catalogs come with it (ExerciseKind, ExerciseStatus), five attempt
-- contexts and nineteen tactical topics under TACTICS, inserted here because
-- production never runs the seed (prisma/seed-data.ts holds the same rows, and
-- prisma/exercise-migration.test.ts checks that both agree).
-- See prisma/schema.prisma and docs/ → Platform → Data model.

-- 1. Catalogs.
CREATE TABLE "ExerciseKind" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExerciseKind_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExerciseKind_code_key" ON "ExerciseKind"("code");

INSERT INTO "ExerciseKind" ("code", "label", "order") VALUES
  ('SEQUENCE', 'Secuencia', 0),
  ('MATE_IN', 'Mate en N', 1)
ON CONFLICT ("code") DO UPDATE SET "label" = EXCLUDED."label", "order" = EXCLUDED."order";

CREATE TABLE "ExerciseStatus" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExerciseStatus_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExerciseStatus_code_key" ON "ExerciseStatus"("code");

INSERT INTO "ExerciseStatus" ("code", "label", "order") VALUES
  ('DRAFT', 'Borrador', 0),
  ('READY', 'Listo', 1),
  ('IN_REVIEW', 'En revisión', 2),
  ('PUBLISHED', 'En la biblioteca', 3),
  ('ARCHIVED', 'Archivado', 4)
ON CONFLICT ("code") DO UPDATE SET "label" = EXCLUDED."label", "order" = EXCLUDED."order";

-- The three contexts the line trainer already had are upserted too, so a
-- database that never ran the seed ends with the whole catalog.
INSERT INTO "AttemptContext" ("code", "label", "order") VALUES
  ('LESSON', 'Lección', 0),
  ('CHAPTER_QUIZ', 'Quiz de capítulo', 1),
  ('TRAINER', 'Entrenador', 2),
  ('SERIES', 'Serie', 3),
  ('PRACTICE', 'Práctica libre', 4),
  ('REVIEW', 'Repaso', 5),
  ('CLASS', 'Clase', 6),
  ('STORM', 'Contrarreloj', 7)
ON CONFLICT ("code") DO UPDATE SET "label" = EXCLUDED."label", "order" = EXCLUDED."order";

-- The tactical motifs hang from TACTICS, created first when missing (its label
-- and order are the seed's, and an existing row is left as it is).
INSERT INTO "Topic" ("code", "label", "order") VALUES
  ('TACTICS', 'Táctica', 0)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "Topic" ("code", "label", "parentId", "order")
SELECT v."code", v."label", (SELECT "id" FROM "Topic" WHERE "code" = 'TACTICS'), v."order"
FROM (VALUES
  ('FORK', 'Ataque doble', 10),
  ('PIN', 'Clavada', 11),
  ('SKEWER', 'Enfilada', 12),
  ('DISCOVERED_ATTACK', 'Ataque a la descubierta', 13),
  ('DOUBLE_CHECK', 'Jaque doble', 14),
  ('DEFLECTION', 'Desviación', 15),
  ('DECOY', 'Atracción', 16),
  ('REMOVING_THE_DEFENDER', 'Eliminación del defensor', 17),
  ('OVERLOADING', 'Sobrecarga', 18),
  ('INTERFERENCE', 'Interferencia', 19),
  ('X_RAY', 'Rayos X', 20),
  ('ZWISCHENZUG', 'Jugada intermedia', 21),
  ('CLEARANCE', 'Despeje', 22),
  ('TRAPPED_PIECE', 'Pieza atrapada', 23),
  ('SACRIFICE', 'Sacrificio', 24),
  ('PROMOTION', 'Coronación', 25),
  ('MATING_ATTACK', 'Ataque al rey', 26),
  ('BACK_RANK_MATE', 'Mate del pasillo', 27),
  ('ZUGZWANG', 'Zugzwang', 28)
) AS v("code", "label", "order")
ON CONFLICT ("code") DO UPDATE SET "label" = EXCLUDED."label", "parentId" = EXCLUDED."parentId", "order" = EXCLUDED."order";

-- 2. The exercise tables, as Prisma's diff writes them.
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT,
    "authorUserId" TEXT,
    "kindId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "prompt" VARCHAR(200),
    "difficulty" INTEGER NOT NULL,
    "hints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "explanation" TEXT,
    "mateIn" INTEGER,
    "solutionPgn" TEXT NOT NULL,
    "startFen" TEXT NOT NULL,
    "startPositionHash" TEXT NOT NULL,
    "solutionPlies" INTEGER NOT NULL,
    "playerMoves" INTEGER NOT NULL,
    "sourceWhite" VARCHAR(120),
    "sourceBlack" VARCHAR(120),
    "sourceEvent" VARCHAR(160),
    "sourceYear" INTEGER,
    "sourceGameId" TEXT,
    "copiedFromId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewNote" VARCHAR(500),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExerciseTopic" (
    "exerciseId" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "ExerciseTopic_pkey" PRIMARY KEY ("exerciseId","topicId")
);

CREATE TABLE "ExerciseSeries" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT,
    "title" VARCHAR(120) NOT NULL,
    "description" VARCHAR(1000),
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseSeries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExerciseSeriesItem" (
    "seriesId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ExerciseSeriesItem_pkey" PRIMARY KEY ("seriesId","exerciseId")
);

CREATE TABLE "ExerciseSeriesShare" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseSeriesShare_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserExerciseState" (
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "firstAttemptAt" TIMESTAMP(3),
    "firstSolvedAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "lastResultId" INTEGER,
    "reviewStep" INTEGER,
    "nextReviewAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserExerciseState_pkey" PRIMARY KEY ("userId","exerciseId")
);

CREATE INDEX "Exercise_teacherId_statusId_idx" ON "Exercise"("teacherId", "statusId");
CREATE INDEX "Exercise_statusId_difficulty_idx" ON "Exercise"("statusId", "difficulty");
CREATE INDEX "Exercise_startPositionHash_idx" ON "Exercise"("startPositionHash");
CREATE INDEX "Exercise_sourceGameId_idx" ON "Exercise"("sourceGameId");
CREATE INDEX "ExerciseTopic_topicId_idx" ON "ExerciseTopic"("topicId");
CREATE INDEX "ExerciseSeries_teacherId_idx" ON "ExerciseSeries"("teacherId");
CREATE INDEX "ExerciseSeriesItem_exerciseId_idx" ON "ExerciseSeriesItem"("exerciseId");
CREATE UNIQUE INDEX "ExerciseSeriesItem_seriesId_order_key" ON "ExerciseSeriesItem"("seriesId", "order");
CREATE INDEX "ExerciseSeriesShare_userId_idx" ON "ExerciseSeriesShare"("userId");
CREATE UNIQUE INDEX "ExerciseSeriesShare_seriesId_userId_key" ON "ExerciseSeriesShare"("seriesId", "userId");
CREATE INDEX "UserExerciseState_userId_nextReviewAt_idx" ON "UserExerciseState"("userId", "nextReviewAt");
CREATE INDEX "UserExerciseState_userId_firstSolvedAt_idx" ON "UserExerciseState"("userId", "firstSolvedAt");
CREATE INDEX "UserExerciseState_exerciseId_idx" ON "UserExerciseState"("exerciseId");

ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_kindId_fkey" FOREIGN KEY ("kindId") REFERENCES "ExerciseKind"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ExerciseStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_sourceGameId_fkey" FOREIGN KEY ("sourceGameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_copiedFromId_fkey" FOREIGN KEY ("copiedFromId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExerciseTopic" ADD CONSTRAINT "ExerciseTopic_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExerciseTopic" ADD CONSTRAINT "ExerciseTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExerciseSeries" ADD CONSTRAINT "ExerciseSeries_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExerciseSeries" ADD CONSTRAINT "ExerciseSeries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExerciseSeriesItem" ADD CONSTRAINT "ExerciseSeriesItem_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "ExerciseSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExerciseSeriesItem" ADD CONSTRAINT "ExerciseSeriesItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExerciseSeriesShare" ADD CONSTRAINT "ExerciseSeriesShare_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "ExerciseSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExerciseSeriesShare" ADD CONSTRAINT "ExerciseSeriesShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExerciseSeriesShare" ADD CONSTRAINT "ExerciseSeriesShare_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserExerciseState" ADD CONSTRAINT "UserExerciseState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserExerciseState" ADD CONSTRAINT "UserExerciseState_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserExerciseState" ADD CONSTRAINT "UserExerciseState_lastResultId_fkey" FOREIGN KEY ("lastResultId") REFERENCES "AttemptResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- The rules Prisma cannot express: the author's difficulty is Elo-like
-- (400–3000), «Mate en N» goes up to 5, at most three hints, a plausible
-- year for the source game, and a teacher's series never reaches the library.
ALTER TABLE "Exercise" ADD CONSTRAINT "exercise_difficulty_range" CHECK ("difficulty" BETWEEN 400 AND 3000);
ALTER TABLE "Exercise" ADD CONSTRAINT "exercise_mate_in_range" CHECK ("mateIn" IS NULL OR "mateIn" BETWEEN 1 AND 5);
ALTER TABLE "Exercise" ADD CONSTRAINT "exercise_hints_max" CHECK (cardinality("hints") <= 3);
ALTER TABLE "Exercise" ADD CONSTRAINT "exercise_source_year" CHECK ("sourceYear" IS NULL OR "sourceYear" BETWEEN 1400 AND 2100);
ALTER TABLE "ExerciseSeries" ADD CONSTRAINT "exercise_series_library_published" CHECK ("teacherId" IS NULL OR "publishedAt" IS NULL);

-- 3. TrainingAttempt: the old column is renamed, never dropped and re-added,
-- so every row keeps its line exercise; the foreign key and the index follow
-- the name, as Prisma's diff expects them (names of 20260830190612_init).
ALTER TABLE "TrainingAttempt" RENAME COLUMN "exerciseId" TO "trainingExerciseId";
ALTER TABLE "TrainingAttempt" ALTER COLUMN "trainingExerciseId" DROP NOT NULL;
ALTER TABLE "TrainingAttempt" RENAME CONSTRAINT "TrainingAttempt_exerciseId_fkey" TO "TrainingAttempt_trainingExerciseId_fkey";
ALTER INDEX "TrainingAttempt_exerciseId_idx" RENAME TO "TrainingAttempt_trainingExerciseId_idx";

ALTER TABLE "TrainingAttempt" ADD COLUMN "exerciseId" TEXT,
ADD COLUMN "seriesId" TEXT,
ADD COLUMN "solutionShown" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "TrainingAttempt" ADD CONSTRAINT "TrainingAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TrainingAttempt" ADD CONSTRAINT "TrainingAttempt_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "ExerciseSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "TrainingAttempt_exerciseId_userId_idx" ON "TrainingAttempt"("exerciseId", "userId");
CREATE INDEX "TrainingAttempt_seriesId_userId_idx" ON "TrainingAttempt"("seriesId", "userId");

-- An attempt is at exactly one exercise: the line drill or an Exercise.
ALTER TABLE "TrainingAttempt" ADD CONSTRAINT "training_attempt_one_exercise" CHECK (("trainingExerciseId" IS NULL) <> ("exerciseId" IS NULL));
