-- Entrenamiento de memoria por lección: marca, métricas del intento, detalle de
-- los fallos y estado de repaso del alumno.
--
-- Puramente ADITIVA: ninguna fila existente cambia. `isTrainable` nace en false,
-- así que hasta que el staff marque una lección todo se comporta igual.

ALTER TABLE "Lesson" ADD COLUMN "isTrainable" BOOLEAN NOT NULL DEFAULT false;

-- Precisión y «perfecto» son métricas distintas y se guardan por separado.
ALTER TABLE "TrainingAttempt" ADD COLUMN "requiredMoves" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TrainingAttempt" ADD COLUMN "correctMoves" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TrainingAttempt" ADD COLUMN "reachedPly" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TrainingAttempt" ADD COLUMN "hintsUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TrainingAttempt" ADD COLUMN "isPerfect" BOOLEAN NOT NULL DEFAULT false;

-- Una fila por jugada FALLADA. La posición se identifica por el hash de su FEN,
-- no por el número de jugada, para que sobreviva a una edición del PGN.
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

-- Estado agregado por alumno y lección: es lo que responde «qué toca repasar».
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

-- Por este índice pasa la consulta de «repasos pendientes» de cada tarjeta.
CREATE INDEX "UserLessonTraining_userId_nextReviewAt_idx" ON "UserLessonTraining"("userId", "nextReviewAt");

ALTER TABLE "UserLessonTraining" ADD CONSTRAINT "UserLessonTraining_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserLessonTraining" ADD CONSTRAINT "UserLessonTraining_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
