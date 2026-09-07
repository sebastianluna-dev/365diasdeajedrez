-- Capítulos y lecciones de introducción y de cierre.
--
-- Un curso puede tener un capítulo que lo abre y otro que lo cierra, y un
-- capítulo puede tener una lección de cada. Los cuatro son OPCIONALES, así que
-- el papel va en una columna anulable: los normales —la inmensa mayoría— tienen
-- `roleId` nulo.
--
-- Esa nulidad es además lo que hace cumplible la regla «como mucho uno de cada»
-- con un índice único corriente sobre (padre, rol): en PostgreSQL NULL no choca
-- con NULL, así que los capítulos normales no compiten entre sí, y dos
-- introducciones en el mismo curso sí.

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

-- SET NULL y no CASCADE: si algún día se retira un papel del catálogo, el
-- capítulo sigue existiendo con su contenido y pasa a ser uno normal.
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "ContentRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "ContentRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Chapter_courseId_roleId_key" ON "Chapter"("courseId", "roleId");
CREATE UNIQUE INDEX "Lesson_chapterId_roleId_key" ON "Lesson"("chapterId", "roleId");
