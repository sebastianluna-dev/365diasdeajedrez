-- "Procedencia del recurso": where a course's material comes from.
--
-- Two catalogs (the kind of resource, and what a source entity is), the
-- entities the courses cite — platforms, publishers, providers — with their
-- kinds, and one row per source of a course. Only the source type is required:
-- material of the academy's own making has no title, entity nor URL. Nothing is
-- seeded here beyond the two catalogs; the entities and the sources are typed
-- by staff.

CREATE TABLE "SourceType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SourceType_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SourceType_code_key" ON "SourceType"("code");

INSERT INTO "SourceType" ("code", "label", "order") VALUES
  ('BOOK', 'Libro', 0),
  ('DIGITAL_COURSE', 'Curso digital', 1),
  ('IN_PERSON_COURSE', 'Curso presencial o taller', 2),
  ('VIDEO', 'Vídeo o serie de vídeos', 3),
  ('ARTICLE', 'Artículo o publicación de blog', 4),
  ('MAGAZINE', 'Revista o boletín', 5),
  ('GAME_DATABASE', 'Base de datos de partidas', 6),
  ('INTERACTIVE_STUDY', 'Estudio interactivo', 7),
  ('COACH_MATERIAL', 'Clase o material de un entrenador', 8),
  ('OWN_MATERIAL', 'Material de elaboración propia', 9),
  ('COMPILATION', 'Recopilación de varias fuentes', 10),
  ('OTHER', 'Otro', 11);

CREATE TABLE "SourceEntityKind" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SourceEntityKind_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SourceEntityKind_code_key" ON "SourceEntityKind"("code");

INSERT INTO "SourceEntityKind" ("code", "label", "order") VALUES
  ('DIGITAL_PLATFORM', 'Plataforma digital', 0),
  ('PUBLISHER', 'Editorial', 1),
  ('CONTENT_PROVIDER', 'Proveedor de contenido', 2),
  ('OTHER', 'Otro', 3);

CREATE TABLE "SourceEntity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceEntity_pkey" PRIMARY KEY ("id")
);

-- Prisma cannot express a unique index over an expression: two entities must
-- not differ only by case, so the index is over lower("name") and the action
-- recognises its name when the insert clashes.
CREATE UNIQUE INDEX "source_entity_name_ci" ON "SourceEntity" (lower("name"));

CREATE TABLE "SourceEntityKindLink" (
    "entityId" TEXT NOT NULL,
    "kindId" INTEGER NOT NULL,

    CONSTRAINT "SourceEntityKindLink_pkey" PRIMARY KEY ("entityId", "kindId")
);

ALTER TABLE "SourceEntityKindLink" ADD CONSTRAINT "SourceEntityKindLink_entityId_fkey"
  FOREIGN KEY ("entityId") REFERENCES "SourceEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SourceEntityKindLink" ADD CONSTRAINT "SourceEntityKindLink_kindId_fkey"
  FOREIGN KEY ("kindId") REFERENCES "SourceEntityKind"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "CourseSource" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "sourceTypeId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "originalTitle" TEXT,
    "authors" TEXT,
    "entityId" TEXT,
    "url" TEXT,
    "publicationYear" INTEGER,
    "edition" TEXT,
    "specificReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSource_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CourseSource_courseId_order_idx" ON "CourseSource"("courseId", "order");
CREATE INDEX "CourseSource_entityId_idx" ON "CourseSource"("entityId");

ALTER TABLE "CourseSource" ADD CONSTRAINT "CourseSource_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseSource" ADD CONSTRAINT "CourseSource_sourceTypeId_fkey"
  FOREIGN KEY ("sourceTypeId") REFERENCES "SourceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- SET NULL and not CASCADE: an entity is never deleted from the interface, but
-- if one ever goes, the source keeps its title, authors and reference.
ALTER TABLE "CourseSource" ADD CONSTRAINT "CourseSource_entityId_fkey"
  FOREIGN KEY ("entityId") REFERENCES "SourceEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
