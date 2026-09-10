-- The side the student trains in a trainable lesson.
--
-- Null means "whoever moves first", which is how it behaved until now, so the
-- migration changes no row. It serves black repertoires: in "1.e4 c6 2.d4 d5"
-- the student must answer c6 and d5, not play e4.
ALTER TABLE "Lesson" ADD COLUMN "trainingColorId" INTEGER;

ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_trainingColorId_fkey"
    FOREIGN KEY ("trainingColorId") REFERENCES "BoardOrientation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
