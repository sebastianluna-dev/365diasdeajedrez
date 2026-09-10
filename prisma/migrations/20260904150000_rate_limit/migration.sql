-- Rate-limit windows, outside the process's memory.
--
-- The counter lived in a Node Map, so the ceiling was per instance: with the app
-- in several processes, an attacker multiplies their login attempts by the
-- number of instances, and in serverless every cold start returns them to zero.
-- In a table, the ceiling is a single one for the whole app.
--
-- Without an `id` of its own: the key is the business one (`login:<email>`,
-- `<userId>:<op>`)
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- For the sweep of expired windows, which is done every so often from the
-- application itself instead of with a scheduled job.
CREATE INDEX "RateLimit_resetAt_idx" ON "RateLimit"("resetAt");
