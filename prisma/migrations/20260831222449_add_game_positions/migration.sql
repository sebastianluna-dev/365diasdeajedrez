-- CreateTable
CREATE TABLE "GamePosition" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "databaseId" TEXT NOT NULL,
    "ply" INTEGER NOT NULL,
    "positionHash" TEXT NOT NULL,
    "nextMoveSan" TEXT,
    "nextMoveUci" TEXT,

    CONSTRAINT "GamePosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GamePosition_positionHash_idx" ON "GamePosition"("positionHash");

-- CreateIndex
CREATE INDEX "GamePosition_positionHash_databaseId_idx" ON "GamePosition"("positionHash", "databaseId");

-- CreateIndex
CREATE INDEX "GamePosition_positionHash_nextMoveUci_idx" ON "GamePosition"("positionHash", "nextMoveUci");

-- CreateIndex
CREATE UNIQUE INDEX "GamePosition_gameId_ply_key" ON "GamePosition"("gameId", "ply");

-- AddForeignKey
ALTER TABLE "GamePosition" ADD CONSTRAINT "GamePosition_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePosition" ADD CONSTRAINT "GamePosition_databaseId_fkey" FOREIGN KEY ("databaseId") REFERENCES "GameDatabase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
