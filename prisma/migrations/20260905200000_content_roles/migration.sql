-- Introduction and closing chapters and lessons.
--
-- A course can have a chapter that opens it and another that closes it, and a
-- chapter can have one lesson of each. All four are OPTIONAL, so the role goes
-- in a nullable column: the normal ones — the vast majority — have a null
-- `roleId`.
--
-- That nullability is also what makes the "at most one of each" rule
-- enforceable with an ordinary unique index over (parent, role): in PostgreSQL
-- NULL does not clash with NULL, so normal chapters do not compete with each
-- other, and two introductions in the same course do.

CREATE TABLE "ContentRole" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ContentRole_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentRole_code_key" ON "ContentRole"("code");

INSERT INTO "ContentRole" ("code", "label", "order") VALUES
  ('INTRO', 'Introducción', 0),
  ('CLOSING', 'Cierre', 1);

ALTER TABLE "Chapter" ADD COLUMN "roleId" INTEGER;
ALTER TABLE "Lesson" ADD COLUMN "roleId" INTEGER;

-- SET NULL and not CASCADE: if a role is ever removed from the catalog, the
-- chapter goes on existing with its content and becomes a normal one.
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "ContentRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "ContentRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Chapter_courseId_roleId_key" ON "Chapter"("courseId", "roleId");
CREATE UNIQUE INDEX "Lesson_chapterId_roleId_key" ON "Lesson"("chapterId", "roleId");
