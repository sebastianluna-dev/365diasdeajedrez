-- «Preparación práctica y psicológica» was two things in one row: what
-- surrounds the game (the clock, the rival, the habits) and what happens in
-- the player's head (nerves, confidence, defeat). A course is about one or
-- about the other, and a name with an "y" in it is a name that does not say
-- what the course teaches. So the row is split.

UPDATE "ContentType"
   SET "label" = 'Preparación práctica',
       "description" = 'Lo que rodea a la partida: gestión del tiempo, toma de decisiones bajo reloj, preparación del rival y hábitos de competición.'
 WHERE "code" = 'PREPARATION';

INSERT INTO "ContentType" ("code", "label", "shortLabel", "description", "order") VALUES
  ('PSYCHOLOGY', 'Psicología del ajedrez', 'Psicología',
   'La cabeza durante la partida: concentración, nervios y confianza, y cómo se afrontan la presión, el error propio y la derrota.', 8)
ON CONFLICT ("code") DO NOTHING;

-- The courses that carried the old type keep «Preparación práctica» and
-- nothing else: which of the two they are about is an editorial call, not
-- something this migration can read from the data. Adding «Psicología del
-- ajedrez» where it belongs is done from the course editor.
