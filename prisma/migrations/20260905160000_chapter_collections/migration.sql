-- A course's game collections become PER CHAPTER.
--
-- Before there was one per course. Each chapter now gathers the games its
-- lessons use; `courseId` stays alongside `chapterId` — not instead of it —
-- because it is what decides who sees the database (a student sees those of the
-- courses they have started) and what makes it possible to list all of the
-- course's games at once without joining by chapter.
--
-- This only opens the slot. Moving the games that already exist and creating
-- those that come from each lesson's own PGN is done by
-- `scripts/migrate-chapter-collections.ts`, which needs to read PGN and does
-- not fit in SQL.
ALTER TABLE "GameDatabase" ADD COLUMN "chapterId" TEXT;

-- A single collection per chapter: it is what makes "this chapter's collection"
-- one row and not a list that has to be disambiguated.
CREATE UNIQUE INDEX "GameDatabase_chapterId_key" ON "GameDatabase"("chapterId");

ALTER TABLE "GameDatabase" ADD CONSTRAINT "GameDatabase_chapterId_fkey"
  FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
