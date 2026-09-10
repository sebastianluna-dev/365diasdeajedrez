-- Out with three lesson metadata fields nobody reads.
--
-- `presentationModeId` and `initialPositionTypeId` were stored and read back
-- solely to re-render their two dropdowns in the staff editor: the student's
-- view never branched on them.
--
-- `initialFen` was a SECOND copy of a value that is already in the PGN: the
-- board takes the position from the [FEN] header (see lib/chess/pgn-tree.ts),
-- and since the lesson references a game (`Lesson.gameId`) nobody maintained
-- that copy. Checked before deleting: all 169 lessons had in the column exactly
-- what their PGN says, so nothing is lost.
--
-- Whoever needs the position now uses `lessonStartFenOf`
-- (services/shared/lesson-pgn.ts), which takes it from the content that rules.

-- First the references are released and then the catalogs are dropped. In
-- PostgreSQL the DROP COLUMN already takes the foreign key with it, but writing
-- it out makes the real order of the operation clear.
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_presentationModeId_fkey";
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_initialPositionTypeId_fkey";

ALTER TABLE "Lesson"
  DROP COLUMN "presentationModeId",
  DROP COLUMN "initialPositionTypeId",
  DROP COLUMN "initialFen";

-- No other table references them, so they fall whole with their indexes.
DROP TABLE "PresentationMode";
DROP TABLE "InitialPositionType";
