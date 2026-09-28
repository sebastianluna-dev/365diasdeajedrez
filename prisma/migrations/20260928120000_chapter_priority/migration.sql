-- A chapter can be marked as priority, as a lesson already can.
--
-- The mark is the staff's. The student sees it on the chapter's card, and with
-- «Prioridad» chosen every lesson of a priority chapter is part of the path,
-- whether the lesson itself is marked or not.
--
-- No chapter is priority until the staff says so, so the rows that exist take
-- the default and nothing changes for a student who is filtering today.

ALTER TABLE "Chapter" ADD COLUMN "isPriority" BOOLEAN NOT NULL DEFAULT false;
