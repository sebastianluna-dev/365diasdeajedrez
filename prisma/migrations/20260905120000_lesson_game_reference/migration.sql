-- La lección puede sacar su contenido de una partida de la colección del curso.
--
-- Hasta ahora `Lesson.pgn` era la fuente única. Sigue siéndolo para las
-- lecciones que no referencian nada —que son todas las de hoy, porque la
-- columna nace nula—, pero cuando hay `gameId` manda la partida: corregirla
-- arregla de una vez todas las lecciones que la usan.
--
-- Quién manda se decide en services/shared/lesson-pgn.ts y en ningún otro
-- sitio.
ALTER TABLE "Lesson" ADD COLUMN "gameId" TEXT;

-- SET NULL y no CASCADE: borrar una partida de la colección no puede llevarse
-- por delante una lección con su nombre, sus temas y el progreso de los
-- alumnos. Se queda sin contenido hasta que se le vincule otra.
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_gameId_fkey"
  FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Para «qué lecciones usan esta partida», que es lo que hay que avisar antes de
-- borrarla y lo que se enseña en la colección del curso.
CREATE INDEX "Lesson_gameId_idx" ON "Lesson"("gameId");
