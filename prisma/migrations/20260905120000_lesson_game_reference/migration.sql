-- The lesson can take its content from a game of the course collection.
--
-- Until now `Lesson.pgn` was the single source. It still is for lessons that
-- reference nothing — which is all of today's, because the column is born null
-- — but when there is a `gameId` the game rules: fixing it fixes at once every
-- lesson that uses it.
--
-- Which one rules is decided in services/shared/lesson-pgn.ts and nowhere else.
ALTER TABLE "Lesson" ADD COLUMN "gameId" TEXT;

-- SET NULL and not CASCADE: deleting a game from the collection cannot take
-- down a lesson with its name, its topics and the students' progress. It is
-- left without content until another one is linked to it.
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_gameId_fkey"
  FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- For "which lessons use this game", which is what has to be warned about
-- before deleting it and what is shown in the course collection.
CREATE INDEX "Lesson_gameId_idx" ON "Lesson"("gameId");
