-- Differentiator of the game within its study ("Capítulo 1").
--
-- Nullable and WITHOUT backfill: the games that already exist stay at NULL and
-- go on being listed by their players, so the migration does not change a single row.
ALTER TABLE "Game" ADD COLUMN "title" TEXT;
