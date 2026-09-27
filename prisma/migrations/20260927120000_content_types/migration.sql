-- Content types: a course teaches SEVERAL things, so the single `CourseType`
-- becomes the `ContentType` catalog plus the `CourseContentType` join. Each
-- type has a long name for the course page, a short one for tags and a
-- description. Existing courses keep what they had: OPENING → OPENINGS,
-- ENDGAME → ENDGAMES, and STRATEGY and TACTICS keep their code. Then the old
-- column and table go.

CREATE TABLE "ContentType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "shortLabel" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContentType_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentType_code_key" ON "ContentType"("code");

INSERT INTO "ContentType" ("code", "label", "shortLabel", "description", "order") VALUES
  ('OPENINGS', 'Aperturas', 'Aperturas',
   'Principios, repertorio, variantes y planes típicos al comenzar la partida.', 0),
  ('TACTICS', 'Táctica', 'Táctica',
   'Patrones concretos: dobles ataques, clavadas, desviaciones, ataques descubiertos y combinaciones de mate.', 1),
  ('CALCULATION', 'Cálculo y visualización', 'Cálculo',
   'Encontrar jugadas candidatas, calcular respuestas y visualizar posiciones sin mover las piezas.', 2),
  ('STRATEGY', 'Estrategia y juego posicional', 'Estrategia',
   'Evaluar posiciones y construir planes: actividad de piezas, casillas débiles, espacio, profilaxis e intercambios.', 3),
  ('PAWN_STRUCTURES', 'Estructuras de peones', 'Estructuras',
   'Cadenas, peones aislados o colgantes, mayorías, rupturas y los planes asociados a cada estructura.', 4),
  ('ENDGAMES', 'Finales', 'Finales',
   'Técnica y posiciones teóricas con pocas piezas: oposición, peones pasados, finales de torres y piezas menores.', 5),
  ('GAME_ANALYSIS', 'Análisis de partidas', 'Análisis',
   'Revisar tus decisiones y estudiar partidas modelo para identificar errores y comprender cómo se conectan las demás áreas.', 6),
  ('PREPARATION', 'Preparación práctica y psicológica', 'Preparación',
   'Gestión del tiempo, toma de decisiones, concentración, manejo de errores y preparación para competir.', 7);

CREATE TABLE "CourseContentType" (
    "courseId" TEXT NOT NULL,
    "contentTypeId" INTEGER NOT NULL,

    CONSTRAINT "CourseContentType_pkey" PRIMARY KEY ("courseId", "contentTypeId")
);

ALTER TABLE "CourseContentType" ADD CONSTRAINT "CourseContentType_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseContentType" ADD CONSTRAINT "CourseContentType_contentTypeId_fkey"
  FOREIGN KEY ("contentTypeId") REFERENCES "ContentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Every course gets the row that matches its old type.
INSERT INTO "CourseContentType" ("courseId", "contentTypeId")
SELECT c."id", ct."id"
  FROM "Course" c
  JOIN "CourseType" old ON old."id" = c."typeId"
  JOIN "ContentType" ct ON ct."code" = CASE old."code"
    WHEN 'OPENING' THEN 'OPENINGS'
    WHEN 'ENDGAME' THEN 'ENDGAMES'
    ELSE old."code"
  END;

-- Abort rather than leave a course with no content type: it is the rule the
-- staff action enforces, and a course whose old type had no match would break it.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Course" c
    WHERE NOT EXISTS (SELECT 1 FROM "CourseContentType" j WHERE j."courseId" = c."id")
  ) THEN
    RAISE EXCEPTION 'Course without content type after the conversion';
  END IF;
END $$;

ALTER TABLE "Course" DROP CONSTRAINT "Course_typeId_fkey";
ALTER TABLE "Course" DROP COLUMN "typeId";
DROP TABLE "CourseType";
