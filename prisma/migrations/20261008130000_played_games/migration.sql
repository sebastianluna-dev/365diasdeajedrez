-- «Jugar»: the games played on the platform — against a bot today, a person
-- later — with the bots, the time controls and how a game ends.
--
-- A played game is NOT a Game: a table of its own, hanging from no study, so
-- «Mis estudios», the position index and the classes never see it. Nothing
-- existing changes: four catalogs and a table come in, and GameResult gains
-- readers, not columns. See prisma/schema.prisma («Jugar») and
-- constants/platform/play-codes.const.ts.

-- ---------------------------------------------------------------------------
-- 1. The catalogs and the bots
-- ---------------------------------------------------------------------------

CREATE TABLE "BotGroup" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "ring" TEXT NOT NULL DEFAULT 'NONE',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BotGroup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BotGroup_code_key" ON "BotGroup"("code");

CREATE TABLE "TimeControl" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "initialSeconds" INTEGER,
    "incrementSeconds" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TimeControl_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TimeControl_code_key" ON "TimeControl"("code");

CREATE TABLE "GameTermination" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GameTermination_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GameTermination_code_key" ON "GameTermination"("code");

CREATE TABLE "Bot" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "elo" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "openings" JSONB,
    "fideElo" INTEGER,
    "fideTitle" TEXT,
    "country" TEXT,
    "ratingAsOf" DATE,
    "groupId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id"),
    -- The label the student sees: 400–2800 (lib/chess/bots/roster.ts).
    CONSTRAINT "bot_elo_range" CHECK ("elo" BETWEEN 400 AND 2800)
);

CREATE UNIQUE INDEX "Bot_slug_key" ON "Bot"("slug");

CREATE INDEX "Bot_groupId_order_idx" ON "Bot"("groupId", "order");

ALTER TABLE "Bot" ADD CONSTRAINT "Bot_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BotGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 2. The played games
-- ---------------------------------------------------------------------------

CREATE TABLE "PlayedGame" (
    "id" TEXT NOT NULL,
    "whiteUserId" TEXT,
    "whiteBotId" INTEGER,
    "blackUserId" TEXT,
    "blackBotId" INTEGER,
    "timeControlId" INTEGER NOT NULL,
    "resultId" INTEGER NOT NULL,
    "terminationId" INTEGER,
    "initialFen" TEXT,
    "pgn" TEXT NOT NULL,
    "plyCount" INTEGER NOT NULL DEFAULT 0,
    "finalFen" TEXT NOT NULL,
    "whiteElo" INTEGER,
    "blackElo" INTEGER,
    "isRated" BOOLEAN NOT NULL DEFAULT false,
    "clockWhiteMs" INTEGER,
    "clockBlackMs" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMoveAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayedGame_pkey" PRIMARY KEY ("id"),
    -- Each seat is a person OR a bot, never both, never neither.
    CONSTRAINT "played_game_white_one_seat" CHECK (("whiteUserId" IS NULL) <> ("whiteBotId" IS NULL)),
    CONSTRAINT "played_game_black_one_seat" CHECK (("blackUserId" IS NULL) <> ("blackBotId" IS NULL)),
    -- A closed game says how it ended; an open one does not yet.
    CONSTRAINT "played_game_closed_has_termination" CHECK (("finishedAt" IS NULL) = ("terminationId" IS NULL)),
    -- A game against a bot never counts toward a rating.
    CONSTRAINT "played_game_bot_never_rated" CHECK (NOT ("isRated" AND ("whiteBotId" IS NOT NULL OR "blackBotId" IS NOT NULL)))
);

CREATE INDEX "PlayedGame_whiteUserId_lastMoveAt_idx" ON "PlayedGame"("whiteUserId", "lastMoveAt");

CREATE INDEX "PlayedGame_blackUserId_lastMoveAt_idx" ON "PlayedGame"("blackUserId", "lastMoveAt");

CREATE INDEX "PlayedGame_whiteUserId_blackBotId_idx" ON "PlayedGame"("whiteUserId", "blackBotId");

CREATE INDEX "PlayedGame_blackUserId_whiteBotId_idx" ON "PlayedGame"("blackUserId", "whiteBotId");

CREATE INDEX "PlayedGame_lastMoveAt_idx" ON "PlayedGame"("lastMoveAt");

CREATE INDEX "PlayedGame_finishedAt_idx" ON "PlayedGame"("finishedAt");

-- One open game against a bot per person and colour: two tabs pressing «Jugar»
-- at once collide here, and `startPlayedGame` takes the second to the open one.
-- Games between people have no such cap.
CREATE UNIQUE INDEX "played_game_white_user_open_vs_bot" ON "PlayedGame"("whiteUserId")
  WHERE "finishedAt" IS NULL AND "blackBotId" IS NOT NULL;

CREATE UNIQUE INDEX "played_game_black_user_open_vs_bot" ON "PlayedGame"("blackUserId")
  WHERE "finishedAt" IS NULL AND "whiteBotId" IS NOT NULL;

-- Every seat RESTRICT: a played game is never deleted, and it outlives no one's history.
ALTER TABLE "PlayedGame" ADD CONSTRAINT "PlayedGame_whiteUserId_fkey" FOREIGN KEY ("whiteUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PlayedGame" ADD CONSTRAINT "PlayedGame_whiteBotId_fkey" FOREIGN KEY ("whiteBotId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PlayedGame" ADD CONSTRAINT "PlayedGame_blackUserId_fkey" FOREIGN KEY ("blackUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PlayedGame" ADD CONSTRAINT "PlayedGame_blackBotId_fkey" FOREIGN KEY ("blackBotId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PlayedGame" ADD CONSTRAINT "PlayedGame_timeControlId_fkey" FOREIGN KEY ("timeControlId") REFERENCES "TimeControl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PlayedGame" ADD CONSTRAINT "PlayedGame_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "GameResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PlayedGame" ADD CONSTRAINT "PlayedGame_terminationId_fkey" FOREIGN KEY ("terminationId") REFERENCES "GameTermination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 3. The rows: production never runs the seed
-- ---------------------------------------------------------------------------

-- BEGIN play catalogs: generated by `npm run bots:sql` (prisma/play-catalog-sql.ts); do not edit by hand

INSERT INTO "BotGroup" ("code", "label", "ring", "order")
VALUES
  ('CHARACTERS', 'Personajes', 'NONE', 0),
  ('MEXICO_OPEN', 'Selección olímpica absoluta', 'TRICOLOR', 1),
  ('MEXICO_WOMEN', 'Selección olímpica femenil', 'TRICOLOR', 2),
  ('MEXICO_LEGENDS', 'Leyendas mexicanas', 'NONE', 3),
  ('WORLD_CHAMPIONS', 'Campeones del mundo', 'GOLD', 4),
  ('ACTIVE', 'En activo', 'NONE', 5)
ON CONFLICT ("code") DO UPDATE SET "label" = EXCLUDED."label", "ring" = EXCLUDED."ring", "order" = EXCLUDED."order";

INSERT INTO "TimeControl" ("code", "label", "initialSeconds", "incrementSeconds", "order", "isActive")
VALUES
  ('NONE', 'Sin tiempo', NULL, 0, 0, TRUE),
  ('BULLET_1_0', '1+0', 60, 0, 1, FALSE),
  ('BULLET_2_1', '2+1', 120, 1, 2, FALSE),
  ('BLITZ_3_0', '3+0', 180, 0, 3, FALSE),
  ('BLITZ_3_2', '3+2', 180, 2, 4, FALSE),
  ('BLITZ_5_0', '5+0', 300, 0, 5, FALSE),
  ('RAPID_10_0', '10+0', 600, 0, 6, FALSE),
  ('RAPID_15_10', '15+10', 900, 10, 7, FALSE),
  ('CLASSICAL_30_0', '30+0', 1800, 0, 8, FALSE)
ON CONFLICT ("code") DO UPDATE SET "label" = EXCLUDED."label", "initialSeconds" = EXCLUDED."initialSeconds", "incrementSeconds" = EXCLUDED."incrementSeconds", "order" = EXCLUDED."order", "isActive" = EXCLUDED."isActive";

INSERT INTO "GameTermination" ("code", "label", "order")
VALUES
  ('CHECKMATE', 'Jaque mate', 0),
  ('STALEMATE', 'Ahogado', 1),
  ('INSUFFICIENT_MATERIAL', 'Material insuficiente', 2),
  ('THREEFOLD_REPETITION', 'Triple repetición', 3),
  ('FIFTY_MOVES', 'Cincuenta jugadas', 4),
  ('RESIGNATION', 'Abandono', 5),
  ('ABANDONED', 'Abandonada', 6),
  ('ABORTED', 'Anulada', 7),
  ('TIMEOUT', 'Tiempo agotado', 8),
  ('DRAW_AGREED', 'Tablas acordadas', 9)
ON CONFLICT ("code") DO UPDATE SET "label" = EXCLUDED."label", "order" = EXCLUDED."order";

INSERT INTO "Bot" ("slug", "name", "elo", "bio", "openings", "fideElo", "fideTitle", "country", "ratingAsOf", "groupId", "order", "isActive")
VALUES
  ('tere', 'Tere', 412, 'Aprendió a mover las piezas este mes. Deja piezas sin defender.', '["Lo que salga"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'CHARACTERS'), 0, TRUE),
  ('beto', 'Beto', 547, 'Va en secundaria y saca la dama en la segunda jugada.', '["Ataque del Pastor"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'CHARACTERS'), 1, TRUE),
  ('lupita', 'Lupita', 668, 'Juega los domingos con su abuelo. Siempre enroca, aunque no haga falta.', '["Partida Italiana"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'CHARACTERS'), 2, TRUE),
  ('don-chuy', 'Don Chuy', 783, 'El rey de la plaza de su colonia. Ataca a tu rey en cuanto puede.', '["Defensa Philidor","Partida Italiana"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'CHARACTERS'), 3, TRUE),
  ('mariana', 'Mariana', 891, 'Cuida sus piezas, pero aún se le escapan las horquillas.', '["Partida Italiana"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'CHARACTERS'), 4, TRUE),
  ('profe-ramirez', 'Profe Ramírez', 1036, 'Maestro de matemáticas. Juega la Italiana desde hace treinta años.', '["Giuoco Piano"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'CHARACTERS'), 5, TRUE),
  ('ximena', 'Ximena', 1174, 'Va a torneos escolares. Sólida en la apertura, nerviosa en el final.', '["Defensa Francesa"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'CHARACTERS'), 6, TRUE),
  ('rodrigo', 'Rodrigo', 1309, 'Gambitos, sacrificios y mucha táctica. Le gusta complicar.', '["Gambito de Rey","Gambito Evans"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'CHARACTERS'), 7, TRUE),
  ('sofia', 'Sofía', 1447, 'Paciente y posicional. Si te descuidas, te gana un final de peones.', '["Caro-Kann","Sistema Londres"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'CHARACTERS'), 8, TRUE),
  ('ivan', 'Iván', 1586, 'Jugador de club en Monterrey. Se sabe la Siciliana de memoria.', '["Defensa Siciliana"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'CHARACTERS'), 9, TRUE),
  ('daniela', 'Daniela', 1723, 'Campeona estatal juvenil. Calcula bien y no regala nada.', '["Defensa Nimzoindia"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'CHARACTERS'), 10, TRUE),
  ('el-ingeniero', 'El Ingeniero', 1868, 'Veterano de los abiertos nacionales. Juega 1.d4 y espera tu error.', '["Gambito de Dama"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'CHARACTERS'), 11, TRUE),
  ('torres-rosas', 'Luis Carlos Torres Rosas', 2385, 'Primer tablero de México en la Olimpiada de Samarcanda 2026.', '[]'::jsonb, 2385, 'IM', 'MEX', '2026-09-01'::date, (SELECT "id" FROM "BotGroup" WHERE "code" = 'MEXICO_OPEN'), 0, TRUE),
  ('hernandez-guerrero', 'Gilberto Hernández Guerrero', 2379, 'Segundo tablero de México en la Olimpiada de Samarcanda 2026.', '[]'::jsonb, 2379, 'GM', 'MEX', '2026-09-01'::date, (SELECT "id" FROM "BotGroup" WHERE "code" = 'MEXICO_OPEN'), 1, TRUE),
  ('avila-rodriguez', 'Joshua Adrián Ávila Rodríguez', 2279, 'Tercer tablero de México en la Olimpiada de Samarcanda 2026.', '[]'::jsonb, 2279, 'FM', 'MEX', '2026-09-01'::date, (SELECT "id" FROM "BotGroup" WHERE "code" = 'MEXICO_OPEN'), 2, TRUE),
  ('fernandez-hernandez', 'Arturo A. Fernández Hernández', 2267, 'Cuarto tablero de México en la Olimpiada de Samarcanda 2026.', '[]'::jsonb, 2267, 'FM', 'MEX', '2026-09-01'::date, (SELECT "id" FROM "BotGroup" WHERE "code" = 'MEXICO_OPEN'), 3, TRUE),
  ('zacarias-rodriguez', 'Santiago Zacarías Rodríguez', 2184, 'Quinto tablero de México en la Olimpiada de Samarcanda 2026.', '[]'::jsonb, 2184, 'FM', 'MEX', '2026-09-01'::date, (SELECT "id" FROM "BotGroup" WHERE "code" = 'MEXICO_OPEN'), 4, TRUE),
  ('corrales-jimenez', 'Zenia Corrales Jiménez', 2125, 'Primer tablero de la selección femenil en Samarcanda 2026.', '[]'::jsonb, 2125, 'WIM', 'MEX', '2026-09-01'::date, (SELECT "id" FROM "BotGroup" WHERE "code" = 'MEXICO_WOMEN'), 0, TRUE),
  ('hernandez-diaz', 'Paula Sofía Hernández Díaz', 2055, 'Segundo tablero de la selección femenil en Samarcanda 2026.', '[]'::jsonb, 2055, 'WFM', 'MEX', '2026-09-01'::date, (SELECT "id" FROM "BotGroup" WHERE "code" = 'MEXICO_WOMEN'), 1, TRUE),
  ('miranda-rodriguez', 'Tania Miranda Rodríguez', 2041, 'Tercer tablero de la selección femenil en Samarcanda 2026.', '[]'::jsonb, 2041, 'WIM', 'MEX', '2026-09-01'::date, (SELECT "id" FROM "BotGroup" WHERE "code" = 'MEXICO_WOMEN'), 2, TRUE),
  ('guzman-garcia', 'Mia Fernanda Guzmán García', 2007, 'Cuarto tablero de la selección femenil en Samarcanda 2026.', '[]'::jsonb, 2007, 'WCM', 'MEX', '2026-09-01'::date, (SELECT "id" FROM "BotGroup" WHERE "code" = 'MEXICO_WOMEN'), 3, TRUE),
  ('olea-valle', 'Scarlett Daniela Olea Valle', 1975, 'Quinto tablero de la selección femenil en Samarcanda 2026.', '[]'::jsonb, 1975, 'WCM', 'MEX', '2026-09-01'::date, (SELECT "id" FROM "BotGroup" WHERE "code" = 'MEXICO_WOMEN'), 4, TRUE),
  ('carlos-torre', 'Carlos Torre Repetto', 2531, 'El del Ataque Torre. En Moscú 1925 le ganó a Lasker, el excampeón del mundo.', '["Ataque Torre"]'::jsonb, NULL, NULL, 'MEX', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'MEXICO_LEGENDS'), 0, TRUE),
  ('steinitz', 'Wilhelm Steinitz', 2457, 'El primer campeón del mundo, de 1886 a 1894.', '["Partida Española"]'::jsonb, NULL, NULL, NULL, NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 0, TRUE),
  ('lasker', 'Emanuel Lasker', 2612, 'Campeón del mundo de 1894 a 1921.', '["Partida Española"]'::jsonb, NULL, NULL, 'GER', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 1, TRUE),
  ('capablanca', 'José Raúl Capablanca', 2668, 'Campeón del mundo de 1921 a 1927. Finales limpios, casi sin errores.', '["Gambito de Dama","Partida Española"]'::jsonb, NULL, NULL, 'CUB', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 2, TRUE),
  ('alekhine', 'Alexander Alekhine', 2646, 'Campeón del mundo de 1927 a 1935 y de 1937 a 1946.', '["Defensa Alekhine"]'::jsonb, NULL, NULL, NULL, NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 3, TRUE),
  ('euwe', 'Max Euwe', 2538, 'Campeón del mundo de 1935 a 1937.', '["Gambito de Dama"]'::jsonb, NULL, NULL, 'NED', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 4, TRUE),
  ('botvinnik', 'Mijaíl Botvínnik', 2628, 'Campeón del mundo de 1948 a 1963, con dos pausas.', '["Defensa Francesa"]'::jsonb, NULL, NULL, NULL, NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 5, TRUE),
  ('smyslov', 'Vasili Smyslov', 2603, 'Campeón del mundo de 1957 a 1958.', '["Partida Española"]'::jsonb, NULL, NULL, NULL, NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 6, TRUE),
  ('tal', 'Mijaíl Tal', 2694, 'El mago de Riga, campeón del mundo de 1960 a 1961. Sacrifica piezas que nadie más sacrificaría.', '["Defensa Siciliana"]'::jsonb, NULL, NULL, NULL, NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 7, TRUE),
  ('petrosian', 'Tigran Petrosián', 2639, 'Campeón del mundo de 1963 a 1969.', '["Defensa Francesa"]'::jsonb, NULL, NULL, NULL, NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 8, TRUE),
  ('spassky', 'Boris Spassky', 2657, 'Campeón del mundo de 1969 a 1972.', '["Partida Española"]'::jsonb, NULL, NULL, NULL, NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 9, TRUE),
  ('fischer', 'Bobby Fischer', 2763, 'Campeón del mundo de 1972 a 1975.', '["Siciliana Najdorf"]'::jsonb, NULL, NULL, 'USA', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 10, TRUE),
  ('karpov', 'Anatoli Kárpov', 2737, 'Campeón del mundo de 1975 a 1985.', '["Caro-Kann"]'::jsonb, NULL, NULL, NULL, NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 11, TRUE),
  ('kasparov', 'Garri Kaspárov', 2786, 'Campeón del mundo de 1985 a 2000.', '["Siciliana Najdorf"]'::jsonb, NULL, NULL, NULL, NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 12, TRUE),
  ('kramnik', 'Vladímir Krámnik', 2753, 'Campeón del mundo de 2000 a 2007.', '["Defensa Berlinesa"]'::jsonb, NULL, NULL, NULL, NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 13, TRUE),
  ('anand', 'Viswanathan Anand', 2749, 'Campeón del mundo de 2007 a 2013.', '["Partida Española"]'::jsonb, NULL, NULL, 'IND', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 14, TRUE),
  ('ding-liren', 'Ding Liren', 2716, 'Campeón del mundo de 2023 a 2024.', '["Partida Catalana"]'::jsonb, NULL, NULL, 'CHN', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'WORLD_CHAMPIONS'), 15, TRUE),
  ('carlsen', 'Magnus Carlsen', 2798, 'Campeón del mundo de 2013 a 2023. El rival más fuerte de la plataforma.', '["De todo"]'::jsonb, NULL, NULL, 'NOR', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'ACTIVE'), 0, TRUE),
  ('nakamura', 'Hikaru Nakamura', 2779, 'Especialista en partidas rápidas.', '["Defensa Nimzoindia"]'::jsonb, NULL, NULL, 'USA', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'ACTIVE'), 1, TRUE),
  ('caruana', 'Fabiano Caruana', 2774, 'Retó a Carlsen por el título en 2018.', '["Defensa Petrov"]'::jsonb, NULL, NULL, 'USA', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'ACTIVE'), 2, TRUE),
  ('gukesh', 'Gukesh D', 2757, 'Campeón del mundo en 2024, a los 18 años.', '["Partida Española"]'::jsonb, NULL, NULL, 'IND', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'ACTIVE'), 3, TRUE),
  ('polgar', 'Judit Polgár', 2689, 'La mejor jugadora de la historia; llegó al top 10 mundial.', '["Defensa Siciliana"]'::jsonb, NULL, NULL, 'HUN', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'ACTIVE'), 4, TRUE),
  ('hou-yifan', 'Hou Yifan', 2641, 'Cuatro veces campeona del mundo femenina.', '["Partida Española"]'::jsonb, NULL, NULL, 'CHN', NULL, (SELECT "id" FROM "BotGroup" WHERE "code" = 'ACTIVE'), 5, TRUE)
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name", "elo" = EXCLUDED."elo", "bio" = EXCLUDED."bio", "openings" = EXCLUDED."openings", "fideElo" = EXCLUDED."fideElo", "fideTitle" = EXCLUDED."fideTitle", "country" = EXCLUDED."country", "ratingAsOf" = EXCLUDED."ratingAsOf", "order" = EXCLUDED."order", "isActive" = EXCLUDED."isActive";

-- END play catalogs
