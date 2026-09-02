-- Partida transcrita por el profesor dentro del bloque de la clase.
--
-- Aditiva: los bloques que hoy referencian una partida se quedan con su gameId y
-- el pgn a NULL, así que se siguen viendo igual.
ALTER TABLE "ClassBlock" ADD COLUMN "pgn" TEXT;
