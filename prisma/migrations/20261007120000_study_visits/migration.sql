-- The last game a person opened in each study: «Mis estudios» opens the study
-- on it, its card shows where that game ends, and «Recientes» orders by when it
-- was opened. One row per person and study, overwritten on every opening; which
-- move the board was on stays in the browser. A new table and nothing else: no
-- row of another changes, and until someone opens a game it is empty and the
-- list does what it did (the first game, ordered by creation).

CREATE TABLE "StudyVisit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "databaseId" TEXT NOT NULL,
    "gameId" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyVisit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StudyVisit_databaseId_idx" ON "StudyVisit"("databaseId");

CREATE INDEX "StudyVisit_gameId_idx" ON "StudyVisit"("gameId");

CREATE UNIQUE INDEX "StudyVisit_userId_databaseId_key" ON "StudyVisit"("userId", "databaseId");

ALTER TABLE "StudyVisit" ADD CONSTRAINT "StudyVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudyVisit" ADD CONSTRAINT "StudyVisit_databaseId_fkey" FOREIGN KEY ("databaseId") REFERENCES "GameDatabase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudyVisit" ADD CONSTRAINT "StudyVisit_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
