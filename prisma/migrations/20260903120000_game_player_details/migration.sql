-- Título FIDE y federación de cada jugador.
--
-- El dato ya venía dentro del PGN de las partidas importadas: la cabecera
-- `WhiteTitle` para el título y `WhiteTeam` para la federación, que es lo que
-- escriben las retransmisiones de Lichess. Se extrae de ahí en vez de dejar las
-- columnas vacías esperando a que alguien las reescriba a mano.
--
-- `substring(... from '...')` con un grupo devuelve ese grupo, o NULL si no
-- casa, que es justo lo que hace falta: una partida sin la cabecera se queda a
-- NULL sin necesidad de un CASE.
ALTER TABLE "Game" ADD COLUMN "whiteTitle" TEXT;
ALTER TABLE "Game" ADD COLUMN "blackTitle" TEXT;
ALTER TABLE "Game" ADD COLUMN "whiteCountry" TEXT;
ALTER TABLE "Game" ADD COLUMN "blackCountry" TEXT;

UPDATE "Game" SET
  "whiteTitle"   = substring("pgn" from '\[WhiteTitle "([^"]+)"\]'),
  "blackTitle"   = substring("pgn" from '\[BlackTitle "([^"]+)"\]'),
  "whiteCountry" = substring("pgn" from '\[WhiteTeam "([^"]+)"\]'),
  "blackCountry" = substring("pgn" from '\[BlackTeam "([^"]+)"\]');
