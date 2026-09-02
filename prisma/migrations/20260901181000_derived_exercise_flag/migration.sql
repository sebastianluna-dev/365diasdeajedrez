-- Distingue el ejercicio que genera el sistema desde la línea principal de los
-- que el staff crea a mano en el editor.
--
-- Aditiva: los ejercicios existentes son todos manuales y se quedan en false, así
-- que la sincronización automática no los va a tocar.
ALTER TABLE "TrainingExercise" ADD COLUMN "isDerived" BOOLEAN NOT NULL DEFAULT false;
