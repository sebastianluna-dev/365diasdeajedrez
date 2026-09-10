-- FIDE title and federation of each player.
--
-- The data already came inside the PGN of the imported games: the `WhiteTitle`
-- header for the title and `WhiteTeam` for the federation, which is what
-- Lichess's broadcasts write. It is extracted from there instead of leaving the
-- columns empty waiting for someone to rewrite them by hand.
--
-- `substring(... from '...')` with a group returns that group, or NULL when it
-- does not match, which is exactly what is needed: a game without the header
-- stays at NULL with no need for a CASE.
ALTER TABLE "Game" ADD COLUMN "whiteTitle" TEXT;
ALTER TABLE "Game" ADD COLUMN "blackTitle" TEXT;
ALTER TABLE "Game" ADD COLUMN "whiteCountry" TEXT;
ALTER TABLE "Game" ADD COLUMN "blackCountry" TEXT;

UPDATE "Game" SET
  "whiteTitle"   = substring("pgn" from '\[WhiteTitle "([^"]+)"\]'),
  "blackTitle"   = substring("pgn" from '\[BlackTitle "([^"]+)"\]'),
  "whiteCountry" = substring("pgn" from '\[WhiteTeam "([^"]+)"\]'),
  "blackCountry" = substring("pgn" from '\[BlackTeam "([^"]+)"\]');
