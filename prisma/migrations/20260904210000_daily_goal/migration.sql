-- Daily study goal, in minutes.
--
-- With a default value so the accounts that already exist have one without
-- backfilling anything: thirty minutes is half an hour of study, which is the
-- unit people think of their day in.
--
-- The daily streak is NOT stored: it is derived from UserActivity by counting
-- consecutive days backwards (see lib/study-streak.ts). Storing it would force
-- keeping it up to date with a nightly job and repairing it when it drifted.
ALTER TABLE "User" ADD COLUMN "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 30;
