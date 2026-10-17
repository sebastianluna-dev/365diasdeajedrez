-- Exercises, phase 3 (2026-10-16): the class block «Ejercicio» (D29, D30;
-- PLAN.md §7.2). A teacher puts one to ten exercises in a block of a class,
-- «Para preparar» or «Después de la clase»; the student solves them from the
-- class, and the attempt remembers the block it was solved from.
--
-- What changes in the model:
--
--   - the catalog row EXERCISE of "ClassBlockKind" (the seed writes the same
--     row with the same label and order, idempotently);
--   - "ClassBlockExercise": the exercises of an EXERCISE block, in order, each
--     once (the primary key) and each order once (the unique index); Cascade
--     from the block, Restrict from the exercise (one a class points at is
--     archived, never deleted). Written only by the teacher's block actions;
--   - "TrainingAttempt"."classBlockId": the block an attempt was solved from
--     (context CLASS), SetNull when the block goes; indexed with the student
--     for «2 de 3 lo resolvieron». Written only by recordExerciseAttempt.
--
-- An EXERCISE block uses none of the single references, so the CHECK
-- class_block_single_ref of the init migration holds as it is. The
-- structure is Prisma's diff; the catalog row is added by hand.
-- prisma/exercise-migration.test.ts reads this file.

-- 1. The catalog row, after FILE (order 5); the label is the seed's.
INSERT INTO "ClassBlockKind" ("code", "label", "order") VALUES
  ('EXERCISE', 'Ejercicio', 6)
ON CONFLICT ("code") DO UPDATE SET "label" = EXCLUDED."label", "order" = EXCLUDED."order";

-- 2. The structure, as Prisma's diff writes it.
-- AlterTable
ALTER TABLE "TrainingAttempt" ADD COLUMN     "classBlockId" TEXT;

-- CreateTable
CREATE TABLE "ClassBlockExercise" (
    "blockId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ClassBlockExercise_pkey" PRIMARY KEY ("blockId","exerciseId")
);

-- CreateIndex
CREATE INDEX "ClassBlockExercise_exerciseId_idx" ON "ClassBlockExercise"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassBlockExercise_blockId_order_key" ON "ClassBlockExercise"("blockId", "order");

-- CreateIndex
CREATE INDEX "TrainingAttempt_classBlockId_userId_idx" ON "TrainingAttempt"("classBlockId", "userId");

-- AddForeignKey
ALTER TABLE "TrainingAttempt" ADD CONSTRAINT "TrainingAttempt_classBlockId_fkey" FOREIGN KEY ("classBlockId") REFERENCES "ClassBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassBlockExercise" ADD CONSTRAINT "ClassBlockExercise_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ClassBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassBlockExercise" ADD CONSTRAINT "ClassBlockExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
