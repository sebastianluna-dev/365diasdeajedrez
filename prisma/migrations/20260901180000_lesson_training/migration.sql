-- Memory training per lesson: the flag, the attempt's metrics, the detail of
-- the mistakes and the student's review state.
--
-- Purely ADDITIVE: no existing row changes. `isTrainable` is born false, so
-- until the staff marks a lesson everything behaves the same.

ALTER TABLE "Lesson" ADD COLUMN "isTrainable" BOOLEAN NOT NULL DEFAULT false;

-- Accuracy and "perfect" are different metrics and are stored separately.
ALTER TABLE "TrainingAttempt" ADD COLUMN "requiredMoves" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TrainingAttempt" ADD COLUMN "correctMoves" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TrainingAttempt" ADD COLUMN "reachedPly" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TrainingAttempt" ADD COLUMN "hintsUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TrainingAttempt" ADD COLUMN "isPerfect" BOOLEAN NOT NULL DEFAULT false;

-- One row per FAILED move. The position is identified by the hash of its FEN,
-- not by the move number, so it survives an edit of the PGN.
CREATE TABLE "TrainingMistake" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "positionHash" TEXT NOT NULL,
    "fen" TEXT NOT NULL,
    "expectedSan" TEXT NOT NULL,
    "playedSan" TEXT NOT NULL,
    "ply" INTEGER NOT NULL,
    "usedHint" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingMistake_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TrainingMistake_attemptId_idx" ON "TrainingMistake"("attemptId");
CREATE INDEX "TrainingMistake_positionHash_idx" ON "TrainingMistake"("positionHash");

ALTER TABLE "TrainingMistake" ADD CONSTRAINT "TrainingMistake_attemptId_fkey"
    FOREIGN KEY ("attemptId") REFERENCES "TrainingAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Aggregate state per student and lesson: it is what answers "what is due for review".
CREATE TABLE "UserLessonTraining" (
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "perfectAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastAccuracy" INTEGER NOT NULL DEFAULT 0,
    "bestAccuracy" INTEGER NOT NULL DEFAULT 0,
    "consecutivePerfect" INTEGER NOT NULL DEFAULT 0,
    "currentIntervalDays" INTEGER NOT NULL DEFAULT 0,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLessonTraining_pkey" PRIMARY KEY ("userId","lessonId")
);

-- This index is what each card's "pending reviews" query goes through.
CREATE INDEX "UserLessonTraining_userId_nextReviewAt_idx" ON "UserLessonTraining"("userId", "nextReviewAt");

ALTER TABLE "UserLessonTraining" ADD CONSTRAINT "UserLessonTraining_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserLessonTraining" ADD CONSTRAINT "UserLessonTraining_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
