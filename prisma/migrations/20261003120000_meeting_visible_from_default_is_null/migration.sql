-- "Class"."meetingUrlVisibleFrom" stores only the instant a teacher CHOSE for
-- the meeting link to become visible. Null with a link now means the default,
-- half an hour before the class, worked out whenever the class is read
-- (services/shared/meeting-visible-from.ts), so it follows the class when it
-- moves and the edit form can tell it from a chosen one.
--
-- Until now the default was stored as an instant like any other. A stored
-- instant exactly half an hour before the class is taken for the default (a
-- teacher who chose that very instant loses nothing but the link following the
-- class if it moves), and an instant on a class without a link, which rows
-- written before 2026-10-02 may keep, goes too: it belongs to the link.
-- Data only, no schema change.

UPDATE "Class"
SET "meetingUrlVisibleFrom" = NULL
WHERE "meetingUrlVisibleFrom" IS NOT NULL
  AND ("meetingUrl" IS NULL OR "meetingUrlVisibleFrom" = "scheduledAt" - INTERVAL '30 minutes');
