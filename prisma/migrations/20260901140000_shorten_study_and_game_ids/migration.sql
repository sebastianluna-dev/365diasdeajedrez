-- Acorta los identificadores de estudios y partidas, que van en la URL.
--
-- Renombra CLAVES PRIMARIAS. Es seguro porque todas las claves foráneas que
-- apuntan a estas dos tablas son ON UPDATE CASCADE, así que los hijos se
-- reescriben solos:
--   Game.databaseId, GamePosition.databaseId  → GameDatabase.id
--   GamePosition.gameId, ClassBlock.gameId    → Game.id
--
-- No hay cambio de esquema: la columna ya era TEXT sin DEFAULT, porque el id lo
-- genera Prisma en el cliente (antes uuid(), ahora nanoid(8)).

-- 1. Las filas del seed, con renombres EXPLÍCITOS.
--
-- prisma/seed.ts hace upsert por estos ids. Si se les diera uno aleatorio, el
-- siguiente `npm run db:seed` no encontraría las filas y crearía duplicados, así
-- que los literales de abajo tienen que ser exactamente los de IDS en
-- prisma/seed-data.ts.
UPDATE "GameDatabase" SET id = 'demoMisP' WHERE id = 'f0000000-0000-4000-8000-000000000001';
UPDATE "GameDatabase" SET id = 'demoAtaq' WHERE id = 'f0000000-0000-4000-8000-000000000002';
UPDATE "GameDatabase" SET id = 'demoSici' WHERE id = 'f0000000-0000-4000-8000-000000000003';

UPDATE "Game" SET id = 'demoOper' WHERE id = 'f1000000-0000-4000-8000-000000000001';
UPDATE "Game" SET id = 'demoInmo' WHERE id = 'f1000000-0000-4000-8000-000000000002';
UPDATE "Game" SET id = 'demoSiem' WHERE id = 'f1000000-0000-4000-8000-000000000003';
UPDATE "Game" SET id = 'demoOpoc' WHERE id = 'f1000000-0000-4000-8000-000000000004';
UPDATE "Game" SET id = 'demoAlap' WHERE id = 'f1000000-0000-4000-8000-000000000005';

-- Y las del curso «Piense como un gran maestro», que trae su propio módulo
-- de sembrado con ids fijos (prisma/seed-courses/think-like-a-grandmaster.ts).
UPDATE "GameDatabase" SET id = 'kotovDb0' WHERE id = 'f0000000-0000-4000-8000-000000000010';

UPDATE "Game" SET id = 'kotovG01' WHERE id = 'f1000000-0000-4000-8000-000000000010';
UPDATE "Game" SET id = 'kotovG02' WHERE id = 'f1000000-0000-4000-8000-000000000011';
UPDATE "Game" SET id = 'kotovG03' WHERE id = 'f1000000-0000-4000-8000-000000000012';
UPDATE "Game" SET id = 'kotovG04' WHERE id = 'f1000000-0000-4000-8000-000000000013';
UPDATE "Game" SET id = 'kotovG05' WHERE id = 'f1000000-0000-4000-8000-000000000014';
UPDATE "Game" SET id = 'kotovG06' WHERE id = 'f1000000-0000-4000-8000-000000000015';
UPDATE "Game" SET id = 'kotovG07' WHERE id = 'f1000000-0000-4000-8000-000000000016';
UPDATE "Game" SET id = 'kotovG08' WHERE id = 'f1000000-0000-4000-8000-000000000017';
UPDATE "Game" SET id = 'kotovG09' WHERE id = 'f1000000-0000-4000-8000-000000000018';
UPDATE "Game" SET id = 'kotovG10' WHERE id = 'f1000000-0000-4000-8000-000000000019';
UPDATE "Game" SET id = 'kotovG11' WHERE id = 'f1000000-0000-4000-8000-000000000020';
UPDATE "Game" SET id = 'kotovG12' WHERE id = 'f1000000-0000-4000-8000-000000000021';
UPDATE "Game" SET id = 'kotovG13' WHERE id = 'f1000000-0000-4000-8000-000000000022';
-- 2. Todo lo demás, con un id aleatorio del mismo alfabeto que usa nanoid.
DO $$
DECLARE
  alphabet CONSTANT text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  row_id text;
  candidate text;
BEGIN
  FOR row_id IN SELECT id FROM "GameDatabase" WHERE length(id) > 8 LOOP
    LOOP
      candidate := '';
      FOR position IN 1..8 LOOP
        candidate := candidate || substr(alphabet, floor(random() * 62)::int + 1, 1);
      END LOOP;
      -- La clave primaria ya impediría el choque; comprobarlo aquí evita que la
      -- migración falle entera por una coincidencia.
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "GameDatabase" WHERE id = candidate);
    END LOOP;
    UPDATE "GameDatabase" SET id = candidate WHERE id = row_id;
  END LOOP;

  FOR row_id IN SELECT id FROM "Game" WHERE length(id) > 8 LOOP
    LOOP
      candidate := '';
      FOR position IN 1..8 LOOP
        candidate := candidate || substr(alphabet, floor(random() * 62)::int + 1, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "Game" WHERE id = candidate);
    END LOOP;
    UPDATE "Game" SET id = candidate WHERE id = row_id;
  END LOOP;
END $$;
