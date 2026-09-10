-- Índices compuestos para dos ordenaciones calientes.
--
-- `Game` se lee siempre por colección y en su orden (`databaseId` + `order`):
-- con el índice sólo sobre `databaseId`, PostgreSQL localizaba las filas y
-- después las ordenaba aparte. `Class` se filtra por profesor y se ordena por
-- fecha en el panel del profesor; los dos índices sueltos no sirven para las
-- dos cosas a la vez. Los compuestos cubren también las consultas que sólo
-- filtran por la primera columna, así que los simples que sustituyen sobran.
--
-- Generado con `prisma migrate diff` a partir del cambio en schema.prisma.

-- DropIndex
DROP INDEX "Game_databaseId_idx";

-- DropIndex
DROP INDEX "Class_teacherId_idx";

-- CreateIndex
CREATE INDEX "Game_databaseId_order_idx" ON "Game"("databaseId", "order");

-- CreateIndex
CREATE INDEX "Class_teacherId_scheduledAt_idx" ON "Class"("teacherId", "scheduledAt");
