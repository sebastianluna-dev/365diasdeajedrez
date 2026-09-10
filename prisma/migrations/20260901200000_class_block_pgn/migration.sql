-- Game transcribed by the teacher inside the class block.
--
-- Additive: the blocks that today reference a game keep their gameId and the pgn
-- at NULL, so they go on being seen the same.
ALTER TABLE "ClassBlock" ADD COLUMN "pgn" TEXT;
