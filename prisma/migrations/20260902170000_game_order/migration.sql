-- Orden manual de las partidas dentro de un estudio.
--
-- El relleno reproduce EXACTAMENTE el orden con el que se venían mostrando
-- (`playedAt` DESC, `createdAt` ASC) para que al desplegar no se reordene nada
-- a la vista de nadie. Ojo con los nulos: en PostgreSQL un DESC los pone
-- primero, y así es como se estaban listando.
ALTER TABLE "Game" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

WITH ordered AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "databaseId"
      ORDER BY "playedAt" DESC, "createdAt" ASC
    ) AS position
  FROM "Game"
)
UPDATE "Game" AS g
SET "order" = ordered.position
FROM ordered
WHERE g."id" = ordered."id";
