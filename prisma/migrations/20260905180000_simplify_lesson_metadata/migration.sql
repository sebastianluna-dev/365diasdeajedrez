-- Fuera tres metadatos de la lección que no lee nadie.
--
-- `presentationModeId` e `initialPositionTypeId` se guardaban y se releían
-- únicamente para repintar sus dos desplegables en el editor del staff: la
-- vista del alumno no se bifurcaba nunca según ellos.
--
-- `initialFen` era una SEGUNDA copia de un dato que ya está en el PGN: la
-- posición la saca el tablero de la cabecera [FEN] (ver lib/chess/pgn-tree.ts),
-- y desde que la lección referencia una partida (`Lesson.gameId`) esa copia no
-- la mantenía nadie. Comprobado antes de borrar: las 169 lecciones tenían en la
-- columna exactamente lo que dice su PGN, así que no se pierde nada.
--
-- Quien necesite la posición usa ahora `lessonStartFenOf`
-- (services/shared/lesson-pgn.ts), que la saca del contenido que manda.

-- Primero se sueltan las referencias y después se tiran los catálogos. En
-- PostgreSQL el DROP COLUMN ya se lleva la clave ajena, pero dejarlo escrito
-- deja claro el orden real de la operación.
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_presentationModeId_fkey";
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_initialPositionTypeId_fkey";

ALTER TABLE "Lesson"
  DROP COLUMN "presentationModeId",
  DROP COLUMN "initialPositionTypeId",
  DROP COLUMN "initialFen";

-- Ninguna otra tabla los referencia, así que caen enteros con sus índices.
DROP TABLE "PresentationMode";
DROP TABLE "InitialPositionType";
