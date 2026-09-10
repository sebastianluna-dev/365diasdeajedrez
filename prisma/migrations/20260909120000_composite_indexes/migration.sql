-- Composite indexes for two hot orderings.
--
-- `Game` is always read by collection and in its order (`databaseId` +
-- `order`): with the index on `databaseId` alone, PostgreSQL located the rows
-- and then sorted them separately. `Class` is filtered by teacher and sorted by
-- date in the teacher panel; the two separate indexes do not serve both at
-- once. The composite ones also cover the queries that only filter by the first
-- column, so the simple ones they replace are redundant.
--
-- Generated with `prisma migrate diff` from the change in schema.prisma.

-- DropIndex
DROP INDEX "Game_databaseId_idx";

-- DropIndex
DROP INDEX "Class_teacherId_idx";

-- CreateIndex
CREATE INDEX "Game_databaseId_order_idx" ON "Game"("databaseId", "order");

-- CreateIndex
CREATE INDEX "Class_teacherId_scheduledAt_idx" ON "Class"("teacherId", "scheduledAt");
