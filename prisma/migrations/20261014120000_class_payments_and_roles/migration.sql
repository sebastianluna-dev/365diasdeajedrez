-- Classes, rebuilt around who does what (2026-10-14): the staff creates every
-- class and registers every payment; the teacher sees their assigned classes,
-- prepares their content, takes attendance and finalizes them; the student
-- sees their classes and how many paid ones are left.
--
-- What changes in the model:
--
--   - A payment is a row of its own, "ClassPayment": an amount for a number of
--     classes. A seat ("ClassParticipant") spends one of its classes by
--     pointing at it; how many are left is counted on reading, never stored.
--     The four payment columns a seat carried (paidAt, amount, currency,
--     paymentRef) become one payment of one class each, and are dropped.
--   - A seat can be free ("isFree": charged to nobody), paid or «Sin pago»; a
--     no-show's seat can be given another date by the staff ("seatMoved*"),
--     and the old row stays as history.
--   - Attendance is nullable (null is «Sin pasar lista») and every mark is kept
--     in "ClassAttendanceChange": who, when, from what to what and why.
--   - A class has a format (individual or group, with a capacity), its end as
--     a column so SQL can filter on it, and the audit of who created, moved,
--     cancelled and closed it. LIVE is no longer written: «En vivo» is a phase
--     of the hour, so the old LIVE rows become SCHEDULED. The teacher relation
--     goes from CASCADE to RESTRICT: deleting a teacher must never take paid
--     seats with it.
--   - A block of a class says when its students see it ("visibilityId").
--
-- Three catalogs come with it (Currency, ClassFormat, ClassBlockVisibility),
-- inserted here because production never runs the seed. The order below: the
-- guard, the catalogs, the payments, the classes, the seats, the blocks and the
-- attendance log; each backfill before the NOT NULL or the CHECK it satisfies.
-- See prisma/schema.prisma and docs/ → Platform → Classes.

-- 0. Guard: a seat with a payment but no usable amount or an unknown currency
-- cannot become a payment. Nothing is converted or dropped in silence: the
-- rows are listed and fixed by hand before migrating.
DO $$
DECLARE
  bad integer;
BEGIN
  SELECT count(*) INTO bad
  FROM "ClassParticipant"
  WHERE "paidAt" IS NOT NULL
    AND ("amount" IS NULL OR "amount" <= 0 OR upper(trim("currency")) NOT IN ('MXN', 'USD', 'EUR'));
  IF bad > 0 THEN
    RAISE EXCEPTION 'class_payments_and_roles: % seat(s) with paidAt but no positive amount or an unknown currency; fix them by hand before migrating (SELECT * FROM "ClassParticipant" WHERE "paidAt" IS NOT NULL AND ("amount" IS NULL OR "amount" <= 0 OR upper(trim("currency")) NOT IN (''MXN'', ''USD'', ''EUR'')))', bad;
  END IF;
END $$;

-- 1. Catalogs.
CREATE TABLE "ClassFormat" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClassFormat_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClassFormat_code_key" ON "ClassFormat"("code");

INSERT INTO "ClassFormat" ("code", "label", "order") VALUES
  ('INDIVIDUAL', 'Individual', 0),
  ('GROUP', 'Grupal', 1)
ON CONFLICT ("code") DO NOTHING;

CREATE TABLE "ClassBlockVisibility" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClassBlockVisibility_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClassBlockVisibility_code_key" ON "ClassBlockVisibility"("code");

INSERT INTO "ClassBlockVisibility" ("code", "label", "order") VALUES
  ('BEFORE', 'Para preparar', 0),
  ('AFTER', 'Después de la clase', 1),
  ('TEACHER', 'Guion del profesor', 2)
ON CONFLICT ("code") DO NOTHING;

CREATE TABLE "Currency" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

INSERT INTO "Currency" ("code", "label", "order") VALUES
  ('MXN', 'Peso mexicano', 0),
  ('USD', 'Dólar estadounidense', 1),
  ('EUR', 'Euro', 2)
ON CONFLICT ("code") DO NOTHING;

-- 2. Payments.
CREATE TABLE "ClassPayment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "paidOn" DATE NOT NULL,
    "classCount" INTEGER NOT NULL,
    "reference" VARCHAR(120),
    "note" VARCHAR(500),
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassPayment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "class_payment_amount_positive" CHECK ("amount" > 0),
    CONSTRAINT "class_payment_class_count_range" CHECK ("classCount" BETWEEN 1 AND 50)
);

CREATE INDEX "ClassPayment_studentId_paidOn_idx" ON "ClassPayment"("studentId", "paidOn");

ALTER TABLE "ClassPayment" ADD CONSTRAINT "ClassPayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClassPayment" ADD CONSTRAINT "ClassPayment_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClassPayment" ADD CONSTRAINT "ClassPayment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Classes. Every new column comes in nullable, is filled, and only then
-- becomes NOT NULL where the model says so.
ALTER TABLE "Class"
  ADD COLUMN "formatId" INTEGER,
  ADD COLUMN "capacity" INTEGER,
  ADD COLUMN "endsAt" TIMESTAMP(3),
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "previousScheduledAt" TIMESTAMP(3),
  ADD COLUMN "rescheduledAt" TIMESTAMP(3),
  ADD COLUMN "rescheduledById" TEXT,
  ADD COLUMN "rescheduleNote" VARCHAR(300),
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "cancelledById" TEXT,
  ADD COLUMN "cancelReason" VARCHAR(300),
  ADD COLUMN "cancelNote" VARCHAR(300),
  ADD COLUMN "closedAt" TIMESTAMP(3),
  ADD COLUMN "closedById" TEXT,
  ADD COLUMN "attendanceTakenAt" TIMESTAMP(3),
  ALTER COLUMN "title" DROP NOT NULL;

-- Every class so far was individual; one with two or more students becomes a
-- group with the capacity it already fills (at least 2, at most 12).
UPDATE "Class" SET "formatId" = (SELECT "id" FROM "ClassFormat" WHERE "code" = 'INDIVIDUAL');

WITH "crowded" AS (
  SELECT "classId", count(*) AS "n"
  FROM "ClassParticipant"
  GROUP BY 1
  HAVING count(*) >= 2
)
UPDATE "Class" AS "class"
   SET "formatId" = (SELECT "id" FROM "ClassFormat" WHERE "code" = 'GROUP'),
       "capacity" = LEAST(GREATEST("crowded"."n", 2), 12)
  FROM "crowded"
 WHERE "class"."id" = "crowded"."classId";

UPDATE "Class" SET "endsAt" = "scheduledAt" + make_interval(mins => "durationMin");

ALTER TABLE "Class" ALTER COLUMN "formatId" SET NOT NULL;
ALTER TABLE "Class" ALTER COLUMN "endsAt" SET NOT NULL;

ALTER TABLE "Class" ADD CONSTRAINT "class_capacity_range" CHECK ("capacity" IS NULL OR "capacity" BETWEEN 2 AND 12);
ALTER TABLE "Class" ADD CONSTRAINT "class_duration_positive" CHECK ("durationMin" > 0);
ALTER TABLE "Class" ADD CONSTRAINT "class_ends_at_derived" CHECK ("endsAt" = "scheduledAt" + make_interval(mins => "durationMin"));

-- «En vivo» is a phase of the hour now: an old LIVE row is a scheduled class.
UPDATE "Class"
   SET "statusId" = (SELECT "id" FROM "ClassStatus" WHERE "code" = 'SCHEDULED')
 WHERE "statusId" = (SELECT "id" FROM "ClassStatus" WHERE "code" = 'LIVE');

-- A finished class was closed by its teacher when it was last saved.
UPDATE "Class" AS "class"
   SET "closedAt" = "class"."updatedAt",
       "closedById" = "teacher"."userId"
  FROM "Teacher" AS "teacher"
 WHERE "teacher"."id" = "class"."teacherId"
   AND "class"."statusId" = (SELECT "id" FROM "ClassStatus" WHERE "code" = 'COMPLETED');

-- A cancelled class kept the staff's reason as a «[Soporte dd/mm] …» prefix of
-- its summary (cancelClassAsStaff, until today): it moves to cancelReason and
-- the summary keeps what the teacher wrote, or nothing.
UPDATE "Class"
   SET "cancelledAt" = "updatedAt",
       "cancelReason" = left(substring("summary" from '^\[Soporte [0-9]{2}/[0-9]{2}\] ([^\n]*)'), 300),
       "summary" = NULLIF(regexp_replace("summary", '^\[Soporte [0-9]{2}/[0-9]{2}\] [^\n]*(\n\n)?', ''), '')
 WHERE "statusId" = (SELECT "id" FROM "ClassStatus" WHERE "code" = 'CANCELLED');

-- The platform of the meeting is read from the link now (storedMeetingProvider,
-- services/shared/meeting-provider.ts), with the same rule as there.
UPDATE "Class"
   SET "meetingProviderId" = CASE
     WHEN "meetingUrl" IS NULL THEN NULL
     WHEN "meetingUrl" ~* '^https?://([a-z0-9-]+\.)*zoom\.us(/|$)' THEN (SELECT "id" FROM "MeetingProvider" WHERE "code" = 'ZOOM')
     WHEN "meetingUrl" ~* '^https?://meet\.google\.com(/|$)' THEN (SELECT "id" FROM "MeetingProvider" WHERE "code" = 'MEET')
     ELSE (SELECT "id" FROM "MeetingProvider" WHERE "code" = 'OTHER')
   END;

-- A class is never deleted, and neither is a teacher with classes.
ALTER TABLE "Class" DROP CONSTRAINT "Class_teacherId_fkey";
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_formatId_fkey" FOREIGN KEY ("formatId") REFERENCES "ClassFormat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_rescheduledById_fkey" FOREIGN KEY ("rescheduledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Class_statusId_endsAt_idx" ON "Class"("statusId", "endsAt");

-- 4. Seats.
ALTER TABLE "ClassParticipant"
  ADD COLUMN "paymentId" TEXT,
  ADD COLUMN "isFree" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "addedById" TEXT,
  ADD COLUMN "seatMovedAt" TIMESTAMP(3),
  ADD COLUMN "seatMovedById" TEXT,
  ADD COLUMN "seatMovedToClassId" TEXT,
  ADD COLUMN "seatMoveNote" VARCHAR(300);

-- One payment of one class for every seat that carried one. The guard above
-- made sure each has a positive amount and a known currency; the day paid is
-- the instant's date in the academy's calendar, Mexico City.
UPDATE "ClassParticipant" SET "paymentId" = gen_random_uuid()::text WHERE "paidAt" IS NOT NULL;

INSERT INTO "ClassPayment" ("id", "studentId", "amount", "currencyId", "paidOn", "classCount", "reference", "note", "recordedById", "createdAt", "updatedAt")
SELECT p."paymentId", p."userId", p."amount",
       (SELECT "id" FROM "Currency" WHERE "code" = upper(trim(p."currency"))),
       ((p."paidAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Mexico_City')::date,
       1, left(p."paymentRef", 120), NULL, NULL, p."createdAt", now()
  FROM "ClassParticipant" AS p
 WHERE p."paymentId" IS NOT NULL;

ALTER TABLE "ClassParticipant"
  DROP COLUMN "paidAt",
  DROP COLUMN "amount",
  DROP COLUMN "currency",
  DROP COLUMN "paymentRef";

-- Null is «Sin pasar lista»; an old explicit «Faltó» (false by default) cannot
-- be told from a list nobody passed, so it becomes null.
ALTER TABLE "ClassParticipant" ALTER COLUMN "attended" DROP DEFAULT;
ALTER TABLE "ClassParticipant" ALTER COLUMN "attended" DROP NOT NULL;
UPDATE "ClassParticipant" SET "attended" = NULL WHERE "attended" = false;

ALTER TABLE "ClassParticipant" ADD CONSTRAINT "class_participant_free_has_no_payment" CHECK (NOT ("isFree" AND "paymentId" IS NOT NULL));
-- IS FALSE, not = false: a moved row whose mark were null would give NULL and pass.
ALTER TABLE "ClassParticipant" ADD CONSTRAINT "class_participant_moved_was_absent" CHECK ("seatMovedAt" IS NULL OR "attended" IS FALSE);

ALTER TABLE "ClassParticipant" ADD CONSTRAINT "ClassParticipant_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "ClassPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClassParticipant" ADD CONSTRAINT "ClassParticipant_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClassParticipant" ADD CONSTRAINT "ClassParticipant_seatMovedById_fkey" FOREIGN KEY ("seatMovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClassParticipant" ADD CONSTRAINT "ClassParticipant_seatMovedToClassId_fkey" FOREIGN KEY ("seatMovedToClassId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ClassParticipant_paymentId_idx" ON "ClassParticipant"("paymentId");

-- 5. Blocks: what a finished class shows is «después de la clase», everything
-- else «para preparar», so nothing that was visible is hidden; and a block is
-- as old as its class, so none of them comes up as «Nuevo».
ALTER TABLE "ClassBlock"
  ADD COLUMN "visibilityId" INTEGER,
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "ClassBlock" AS "block"
   SET "visibilityId" = CASE
         WHEN "class"."statusId" = (SELECT "id" FROM "ClassStatus" WHERE "code" = 'COMPLETED')
           THEN (SELECT "id" FROM "ClassBlockVisibility" WHERE "code" = 'AFTER')
         ELSE (SELECT "id" FROM "ClassBlockVisibility" WHERE "code" = 'BEFORE')
       END,
       "createdAt" = "class"."createdAt"
  FROM "Class" AS "class"
 WHERE "class"."id" = "block"."classId";

ALTER TABLE "ClassBlock" ALTER COLUMN "visibilityId" SET NOT NULL;

ALTER TABLE "ClassBlock" ADD CONSTRAINT "ClassBlock_visibilityId_fkey" FOREIGN KEY ("visibilityId") REFERENCES "ClassBlockVisibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. The attendance log: every mark that exists was the teacher's, written
-- when the class was last saved.
CREATE TABLE "ClassAttendanceChange" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromAttended" BOOLEAN,
    "toAttended" BOOLEAN NOT NULL,
    "reason" VARCHAR(300),
    "changedById" TEXT,
    "isOverride" BOOLEAN NOT NULL DEFAULT false,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassAttendanceChange_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClassAttendanceChange_classId_userId_changedAt_idx" ON "ClassAttendanceChange"("classId", "userId", "changedAt");

ALTER TABLE "ClassAttendanceChange" ADD CONSTRAINT "ClassAttendanceChange_classId_userId_fkey" FOREIGN KEY ("classId", "userId") REFERENCES "ClassParticipant"("classId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassAttendanceChange" ADD CONSTRAINT "ClassAttendanceChange_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "ClassAttendanceChange" ("id", "classId", "userId", "fromAttended", "toAttended", "reason", "changedById", "isOverride", "changedAt")
SELECT gen_random_uuid()::text, p."classId", p."userId", NULL, true, NULL, "teacher"."userId", false, "class"."updatedAt"
  FROM "ClassParticipant" AS p
  JOIN "Class" AS "class" ON "class"."id" = p."classId"
  JOIN "Teacher" AS "teacher" ON "teacher"."id" = "class"."teacherId"
 WHERE p."attended" = true;

UPDATE "Class"
   SET "attendanceTakenAt" = "updatedAt"
 WHERE EXISTS (SELECT 1 FROM "ClassParticipant" AS p WHERE p."classId" = "Class"."id" AND p."attended" IS NOT NULL);
