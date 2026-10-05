-- A game of a study gets three settings of its owner's, set from the gear of
-- its row in the list of games, as Lichess keeps them behind a chapter's:
--
--   - which side the board opens from (`orientationId`, the catalog lessons
--     and positions already use);
--   - how a reader who cannot edit it goes through it (`analysisModeId`, a
--     new catalog: for now, with the next moves hidden);
--   - a comment pinned under the board whatever the move (`pinnedComment`).
--
-- All three are nullable and null is what every game was until today: White
-- at the bottom, plain analysis, no comment. So no row changes, and nothing
-- that creates a game has to say anything about them.

CREATE TABLE "GameAnalysisMode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GameAnalysisMode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GameAnalysisMode_code_key" ON "GameAnalysisMode"("code");

-- The plain analysis is not a row: it is a game with no mode.
INSERT INTO "GameAnalysisMode" ("code", "label", "order") VALUES
  ('CONCEAL', 'Ocultar los siguientes movimientos', 0)
ON CONFLICT ("code") DO NOTHING;

ALTER TABLE "Game" ADD COLUMN "orientationId" INTEGER;
ALTER TABLE "Game" ADD COLUMN "analysisModeId" INTEGER;
ALTER TABLE "Game" ADD COLUMN "pinnedComment" TEXT;

ALTER TABLE "Game" ADD CONSTRAINT "Game_orientationId_fkey"
  FOREIGN KEY ("orientationId") REFERENCES "BoardOrientation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Game" ADD CONSTRAINT "Game_analysisModeId_fkey"
  FOREIGN KEY ("analysisModeId") REFERENCES "GameAnalysisMode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
