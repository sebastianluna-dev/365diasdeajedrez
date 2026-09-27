-- Levels: who a course is aimed at, with an orientative Elo range.
--
-- The `Level` catalog becomes content the staff edits at
-- /administracion/niveles, so it is identified by a `slug` instead of a `code`,
-- and gains a description and an inclusive Elo range (`eloMax` null = no upper
-- bound). The ranges are an internal, orientative classification: nothing
-- decides access by them.
--
-- The rows are updated IN PLACE: their ids do not change, so every
-- `CourseLevel` assignment survives. The four levels the platform shipped with
-- get their slug and range, and the two that are new («Iniciación» below,
-- «Maestro» above) are inserted only if they are not there, so running this
-- over a catalog that already has them duplicates nothing.
--
-- A course also gets its optional "conocimientos previos".

ALTER TABLE "Level" RENAME COLUMN "code" TO "slug";
ALTER TABLE "Level" RENAME COLUMN "label" TO "name";
ALTER INDEX "Level_code_key" RENAME TO "Level_slug_key";

-- The defaults only serve the rows that exist; they are dropped below, so a
-- level is never born without its description and its range.
ALTER TABLE "Level"
  ADD COLUMN "description" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "eloMin" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "eloMax" INTEGER;

UPDATE "Level"
   SET "slug" = 'principiante', "name" = 'Principiante', "order" = 2, "eloMin" = 800, "eloMax" = 1199,
       "description" = 'Tácticas elementales, principios de apertura y finales básicos.'
 WHERE "slug" = 'BEGINNER';

UPDATE "Level"
   SET "slug" = 'intermedio', "name" = 'Intermedio', "order" = 3, "eloMin" = 1200, "eloMax" = 1599,
       "description" = 'Cálculo, evaluación de posiciones, planificación y estructuras de peones.'
 WHERE "slug" = 'INTERMEDIATE';

UPDATE "Level"
   SET "slug" = 'avanzado', "name" = 'Avanzado', "order" = 4, "eloMin" = 1600, "eloMax" = 1999,
       "description" = 'Cálculo complejo, estrategia, repertorio, finales y preparación competitiva.'
 WHERE "slug" = 'ADVANCED';

-- «Experto» stops being the open-ended top: it ends at 2199 and «Maestro» takes over.
UPDATE "Level"
   SET "slug" = 'experto', "name" = 'Experto', "order" = 5, "eloMin" = 2000, "eloMax" = 2199,
       "description" = 'Análisis profundo, técnica avanzada y perfeccionamiento del juego competitivo.'
 WHERE "slug" = 'EXPERT';

-- Any other row (the platform shipped none) keeps its name and its
-- assignments; only its old code takes the shape of a slug.
UPDATE "Level"
   SET "slug" = trim(both '-' from regexp_replace(lower("slug"), '[^a-z0-9]+', '-', 'g'))
 WHERE "slug" NOT IN ('principiante', 'intermedio', 'avanzado', 'experto')
   AND "slug" !~ '^[a-z0-9]+(-[a-z0-9]+)*$';

INSERT INTO "Level" ("slug", "name", "description", "order", "eloMin", "eloMax") VALUES
  ('iniciacion', 'Iniciación',
   'Reglas, movimiento de las piezas, jaque, mate y principios básicos.', 1, 0, 799),
  ('principiante', 'Principiante',
   'Tácticas elementales, principios de apertura y finales básicos.', 2, 800, 1199),
  ('intermedio', 'Intermedio',
   'Cálculo, evaluación de posiciones, planificación y estructuras de peones.', 3, 1200, 1599),
  ('avanzado', 'Avanzado',
   'Cálculo complejo, estrategia, repertorio, finales y preparación competitiva.', 4, 1600, 1999),
  ('experto', 'Experto',
   'Análisis profundo, técnica avanzada y perfeccionamiento del juego competitivo.', 5, 2000, 2199),
  ('maestro', 'Maestro',
   'Preparación especializada, decisiones posicionales sutiles, cálculo exigente y análisis de alto nivel.',
   6, 2200, NULL)
ON CONFLICT ("slug") DO NOTHING;

ALTER TABLE "Level"
  ALTER COLUMN "description" DROP DEFAULT,
  ALTER COLUMN "eloMin" DROP DEFAULT;

-- Prisma cannot express a check: the range is never negative nor upside down.
-- The staff action validates the same before writing; this is the last line.
ALTER TABLE "Level" ADD CONSTRAINT "level_elo_range"
  CHECK ("eloMin" >= 0 AND ("eloMax" IS NULL OR "eloMax" >= "eloMin"));

ALTER TABLE "Course" ADD COLUMN "priorKnowledge" TEXT;
