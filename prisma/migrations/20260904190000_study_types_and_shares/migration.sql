-- Los cuatro tipos de estudio de la especificación, el reparto de colecciones
-- y la unicidad de «Mis partidas».
--
-- Ver constants/platform/study-codes.const.ts (el catálogo) y
-- services/studies/study-rules.ts (qué puede hacerse con cada tipo).

-- ---------------------------------------------------------------------------
-- 1. Catálogo DatabaseKind: entra «Torneo», sale «Repertorio»
-- ---------------------------------------------------------------------------

-- «Torneo» agrupa las partidas que el alumno jugó en una misma competición.
INSERT INTO "DatabaseKind" ("code", "label", "order")
VALUES ('TOURNAMENT', 'Torneo', 1)
ON CONFLICT ("code") DO UPDATE SET "label" = EXCLUDED."label", "order" = EXCLUDED."order";

-- El orden del catálogo es el de la especificación y lo lee el desplegable de
-- «nuevo estudio», así que se recoloca el resto.
UPDATE "DatabaseKind" SET "order" = 0 WHERE "code" = 'MY_GAMES';
UPDATE "DatabaseKind" SET "order" = 2 WHERE "code" = 'STUDY';
UPDATE "DatabaseKind" SET "order" = 3 WHERE "code" = 'COLLECTION';

-- «Repertorio» no es uno de los cuatro tipos. Las bases que lo tuvieran pasan a
-- «Estudio», que es lo que son —material que el alumno junta para analizar—;
-- así el DELETE de después no puede chocar con una clave ajena.
UPDATE "GameDatabase"
   SET "kindId" = (SELECT "id" FROM "DatabaseKind" WHERE "code" = 'STUDY')
 WHERE "kindId" = (SELECT "id" FROM "DatabaseKind" WHERE "code" = 'REPERTOIRE');

DELETE FROM "DatabaseKind" WHERE "code" = 'REPERTOIRE';

-- ---------------------------------------------------------------------------
-- 2. Reparto de colecciones
-- ---------------------------------------------------------------------------

CREATE TABLE "StudyShare" (
    "id" TEXT NOT NULL,
    "databaseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyShare_pkey" PRIMARY KEY ("id")
);

-- Una colección se reparte a varios alumnos, pero a cada uno una sola vez.
CREATE UNIQUE INDEX "StudyShare_databaseId_userId_key" ON "StudyShare"("databaseId", "userId");

-- Para la consulta caliente: «qué colecciones me han repartido», que entra en
-- el filtro de visibilidad de Mis estudios y del buscador por posición.
CREATE INDEX "StudyShare_userId_idx" ON "StudyShare"("userId");

ALTER TABLE "StudyShare" ADD CONSTRAINT "StudyShare_databaseId_fkey"
  FOREIGN KEY ("databaseId") REFERENCES "GameDatabase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyShare" ADD CONSTRAINT "StudyShare_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyShare" ADD CONSTRAINT "StudyShare_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 3. «Mis partidas»: una por alumno, y que no falte a nadie
-- ---------------------------------------------------------------------------

-- Cuentas creadas antes de que la alta la creara sola. `nanoid(8)` lo genera
-- Prisma en el cliente y aquí no hay cliente, así que el id se compone con
-- md5() del id del usuario recortado a ocho: es determinista —volver a correr
-- la migración no duplica nada— y del mismo alfabeto que los demás.
INSERT INTO "GameDatabase" ("id", "ownerTypeId", "userId", "name", "description", "kindId", "isDefault", "order", "createdAt", "updatedAt")
SELECT
    substr(md5('my-games:' || u."id"), 1, 8),
    (SELECT "id" FROM "OwnerType" WHERE "code" = 'USER'),
    u."id",
    'Mis partidas',
    'Tus partidas que no pertenecen a ningún torneo.',
    (SELECT "id" FROM "DatabaseKind" WHERE "code" = 'MY_GAMES'),
    true,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User" u
WHERE NOT EXISTS (
    SELECT 1 FROM "GameDatabase" d WHERE d."userId" = u."id" AND d."isDefault" = true
);

-- Constraint manual (no expresable en Prisma Schema; ver prisma/schema.prisma).
--
-- Exactamente un «Mis partidas» por alumno. La alta de la cuenta lo crea y
-- nadie más lo crea nunca, pero dos altas a la vez pasarían las dos cualquier
-- comprobación en código y sólo el índice las separa.
CREATE UNIQUE INDEX "game_database_one_default_per_user"
  ON "GameDatabase" ("userId") WHERE "isDefault" = true;
