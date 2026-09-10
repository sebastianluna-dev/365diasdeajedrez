-- Tells apart the exercise the system generates from the main line from those
-- the staff creates by hand in the editor.
--
-- Additive: the existing exercises are all manual and stay at false, so the
-- automatic synchronisation is not going to touch them.
ALTER TABLE "TrainingExercise" ADD COLUMN "isDerived" BOOLEAN NOT NULL DEFAULT false;
