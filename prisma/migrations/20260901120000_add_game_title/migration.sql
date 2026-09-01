-- Diferenciador de la partida dentro de su estudio («Capítulo 1»).
--
-- Anulable y SIN relleno: las partidas que ya existen se quedan a NULL y se
-- siguen listando por sus jugadores, así que la migración no cambia ni una fila.
ALTER TABLE "Game" ADD COLUMN "title" TEXT;
