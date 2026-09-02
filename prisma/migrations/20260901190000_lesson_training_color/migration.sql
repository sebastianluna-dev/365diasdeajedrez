-- Bando que entrena el alumno en una lección entrenable.
--
-- Nulo significa «el que mueva primero», que es como se comportaba hasta ahora,
-- así que la migración no cambia ninguna fila. Sirve para los repertorios de
-- negras: en «1.e4 c6 2.d4 d5» el alumno debe responder c6 y d5, no jugar e4.
ALTER TABLE "Lesson" ADD COLUMN "trainingColorId" INTEGER;

ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_trainingColorId_fkey"
    FOREIGN KEY ("trainingColorId") REFERENCES "BoardOrientation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
