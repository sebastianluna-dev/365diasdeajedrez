-- Las colecciones de partidas de un curso pasan a ser POR CAPÍTULO.
--
-- Antes había una por curso. Cada capítulo junta ahora las partidas que usan
-- sus lecciones; `courseId` se queda además de `chapterId` —no en su lugar—
-- porque es lo que decide quién ve la base (un alumno ve las de los cursos que
-- ha empezado) y lo que permite listar de una vez todas las partidas del curso
-- sin unir por capítulo.
--
-- Esto sólo abre el hueco. El traslado de las partidas que ya existen y el
-- alta de las que salen del PGN propio de cada lección los hace
-- `scripts/migrate-chapter-collections.ts`, que necesita leer PGN y no cabe en
-- SQL.
ALTER TABLE "GameDatabase" ADD COLUMN "chapterId" TEXT;

-- Una sola colección por capítulo: es lo que hace que «la colección de este
-- capítulo» sea una fila y no una lista que haya que desempatar.
CREATE UNIQUE INDEX "GameDatabase_chapterId_key" ON "GameDatabase"("chapterId");

ALTER TABLE "GameDatabase" ADD CONSTRAINT "GameDatabase_chapterId_fkey"
  FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
