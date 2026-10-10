import { BOT_GROUP, type BotGroupCode } from "@/constants/platform/play-codes.const";

// The bots, in one place: the seed reads it, the SQL of the migrations is
// generated from it (`npm run bots:sql`), and the calibration takes its slugs
// and Elos from it. Pure data, no Prisma.
//
// `elo` is the label the student sees: between 400 and 2800 and never a round
// number (planning decision C2); Carlsen is the strongest. How Stockfish is
// weakened to it is `strengthFor(elo)` in `bot-strength.ts`, never stored. The
// labels are approximate until the calibration says otherwise, and the sheet
// says «≈».
//
// Real people (the Mexican teams, the champions, the stars) carry facts as
// facts: their FIDE title and rating with the date they were true. The `bio`
// is the academy's own text. A bot named after a player does not play like
// them: it is Stockfish, weakened.

export interface BotSeed {
  /** The bot's address: `/jugar/partida-libre?rival=<slug>`. Never changes. */
  slug: string;
  name: string;
  /** The label: 400–2800, never a multiple of 100. */
  elo: number;
  group: BotGroupCode;
  /** Its place inside the group. */
  order: number;
  /** One line about how it plays, or who the player is. */
  bio: string;
  /** Favourite openings, as copy for its card. */
  openings: string[];
  /** FIDE's three-letter federation code (`federations.ts`), for the flag; null when it would say nothing true. */
  country: string | null;
  fideTitle: string | null;
  fideElo: number | null;
  /** When `fideElo` was true, as an ISO date. */
  ratingAsOf: string | null;
  isActive: boolean;
}

/** The ratings of Mexico's teams at the 46th Olympiad, Samarcanda, September 2026 (FENAMAC). */
const OLYMPIAD_2026 = "2026-09-01";

type Row = Omit<BotSeed, "group" | "order" | "isActive" | "fideTitle" | "fideElo" | "ratingAsOf"> &
  Partial<Pick<BotSeed, "fideTitle" | "fideElo" | "ratingAsOf">>;

const group = (code: BotGroupCode, rows: Row[]): BotSeed[] =>
  rows.map((row, index) => ({
    fideTitle: null,
    fideElo: null,
    ratingAsOf: null,
    ...row,
    group: code,
    order: index,
    isActive: true,
  }));

const CHARACTERS = group(BOT_GROUP.CHARACTERS, [
  {
    slug: "tere",
    name: "Tere",
    elo: 412,
    country: "MEX",
    bio: "Aprendió a mover las piezas este mes. Deja piezas sin defender.",
    openings: ["Lo que salga"],
  },
  {
    slug: "beto",
    name: "Beto",
    elo: 547,
    country: "MEX",
    bio: "Va en secundaria y saca la dama en la segunda jugada.",
    openings: ["Ataque del Pastor"],
  },
  {
    slug: "lupita",
    name: "Lupita",
    elo: 668,
    country: "MEX",
    bio: "Juega los domingos con su abuelo. Siempre enroca, aunque no haga falta.",
    openings: ["Partida Italiana"],
  },
  {
    slug: "don-chuy",
    name: "Don Chuy",
    elo: 783,
    country: "MEX",
    bio: "El rey de la plaza de su colonia. Ataca a tu rey en cuanto puede.",
    openings: ["Defensa Philidor", "Partida Italiana"],
  },
  {
    slug: "mariana",
    name: "Mariana",
    elo: 891,
    country: "MEX",
    bio: "Cuida sus piezas, pero aún se le escapan las horquillas.",
    openings: ["Partida Italiana"],
  },
  {
    slug: "profe-ramirez",
    name: "Profe Ramírez",
    elo: 1036,
    country: "MEX",
    bio: "Maestro de matemáticas. Juega la Italiana desde hace treinta años.",
    openings: ["Giuoco Piano"],
  },
  {
    slug: "ximena",
    name: "Ximena",
    elo: 1174,
    country: "MEX",
    bio: "Va a torneos escolares. Sólida en la apertura, nerviosa en el final.",
    openings: ["Defensa Francesa"],
  },
  {
    slug: "rodrigo",
    name: "Rodrigo",
    elo: 1309,
    country: "MEX",
    bio: "Gambitos, sacrificios y mucha táctica. Le gusta complicar.",
    openings: ["Gambito de Rey", "Gambito Evans"],
  },
  {
    slug: "sofia",
    name: "Sofía",
    elo: 1447,
    country: "MEX",
    bio: "Paciente y posicional. Si te descuidas, te gana un final de peones.",
    openings: ["Caro-Kann", "Sistema Londres"],
  },
  {
    slug: "ivan",
    name: "Iván",
    elo: 1586,
    country: "MEX",
    bio: "Jugador de club en Monterrey. Se sabe la Siciliana de memoria.",
    openings: ["Defensa Siciliana"],
  },
  {
    slug: "daniela",
    name: "Daniela",
    elo: 1723,
    country: "MEX",
    bio: "Campeona estatal juvenil. Calcula bien y no regala nada.",
    openings: ["Defensa Nimzoindia"],
  },
  {
    slug: "el-ingeniero",
    name: "El Ingeniero",
    elo: 1868,
    country: "MEX",
    bio: "Veterano de los abiertos nacionales. Juega 1.d4 y espera tu error.",
    openings: ["Gambito de Dama"],
  },
]);

const MEXICO_OPEN = group(BOT_GROUP.MEXICO_OPEN, [
  {
    slug: "torres-rosas",
    name: "Luis Carlos Torres Rosas",
    elo: 2385,
    fideTitle: "IM",
    fideElo: 2385,
    ratingAsOf: OLYMPIAD_2026,
    country: "MEX",
    bio: "Primer tablero de México en la Olimpiada de Samarcanda 2026.",
    openings: [],
  },
  {
    slug: "hernandez-guerrero",
    name: "Gilberto Hernández Guerrero",
    elo: 2379,
    fideTitle: "GM",
    fideElo: 2379,
    ratingAsOf: OLYMPIAD_2026,
    country: "MEX",
    bio: "Segundo tablero de México en la Olimpiada de Samarcanda 2026.",
    openings: [],
  },
  {
    slug: "avila-rodriguez",
    name: "Joshua Adrián Ávila Rodríguez",
    elo: 2279,
    fideTitle: "FM",
    fideElo: 2279,
    ratingAsOf: OLYMPIAD_2026,
    country: "MEX",
    bio: "Tercer tablero de México en la Olimpiada de Samarcanda 2026.",
    openings: [],
  },
  {
    slug: "fernandez-hernandez",
    name: "Arturo A. Fernández Hernández",
    elo: 2267,
    fideTitle: "FM",
    fideElo: 2267,
    ratingAsOf: OLYMPIAD_2026,
    country: "MEX",
    bio: "Cuarto tablero de México en la Olimpiada de Samarcanda 2026.",
    openings: [],
  },
  {
    slug: "zacarias-rodriguez",
    name: "Santiago Zacarías Rodríguez",
    elo: 2184,
    fideTitle: "FM",
    fideElo: 2184,
    ratingAsOf: OLYMPIAD_2026,
    country: "MEX",
    bio: "Quinto tablero de México en la Olimpiada de Samarcanda 2026.",
    openings: [],
  },
]);

const MEXICO_WOMEN = group(BOT_GROUP.MEXICO_WOMEN, [
  {
    slug: "corrales-jimenez",
    name: "Zenia Corrales Jiménez",
    elo: 2125,
    fideTitle: "WIM",
    fideElo: 2125,
    ratingAsOf: OLYMPIAD_2026,
    country: "MEX",
    bio: "Primer tablero de la selección femenil en Samarcanda 2026.",
    openings: [],
  },
  {
    slug: "hernandez-diaz",
    name: "Paula Sofía Hernández Díaz",
    elo: 2055,
    fideTitle: "WFM",
    fideElo: 2055,
    ratingAsOf: OLYMPIAD_2026,
    country: "MEX",
    bio: "Segundo tablero de la selección femenil en Samarcanda 2026.",
    openings: [],
  },
  {
    slug: "miranda-rodriguez",
    name: "Tania Miranda Rodríguez",
    elo: 2041,
    fideTitle: "WIM",
    fideElo: 2041,
    ratingAsOf: OLYMPIAD_2026,
    country: "MEX",
    bio: "Tercer tablero de la selección femenil en Samarcanda 2026.",
    openings: [],
  },
  {
    slug: "guzman-garcia",
    name: "Mia Fernanda Guzmán García",
    elo: 2007,
    fideTitle: "WCM",
    fideElo: 2007,
    ratingAsOf: OLYMPIAD_2026,
    country: "MEX",
    bio: "Cuarto tablero de la selección femenil en Samarcanda 2026.",
    openings: [],
  },
  {
    slug: "olea-valle",
    name: "Scarlett Daniela Olea Valle",
    elo: 1975,
    fideTitle: "WCM",
    fideElo: 1975,
    ratingAsOf: OLYMPIAD_2026,
    country: "MEX",
    bio: "Quinto tablero de la selección femenil en Samarcanda 2026.",
    openings: [],
  },
]);

const MEXICO_LEGENDS = group(BOT_GROUP.MEXICO_LEGENDS, [
  {
    slug: "carlos-torre",
    name: "Carlos Torre Repetto",
    elo: 2531,
    country: "MEX",
    bio: "El del Ataque Torre. En Moscú 1925 le ganó a Lasker, el excampeón del mundo.",
    openings: ["Ataque Torre"],
  },
]);

const WORLD_CHAMPIONS = group(BOT_GROUP.WORLD_CHAMPIONS, [
  {
    slug: "steinitz",
    name: "Wilhelm Steinitz",
    elo: 2457,
    country: null,
    bio: "El primer campeón del mundo, de 1886 a 1894.",
    openings: ["Partida Española"],
  },
  {
    slug: "lasker",
    name: "Emanuel Lasker",
    elo: 2612,
    country: "GER",
    bio: "Campeón del mundo de 1894 a 1921.",
    openings: ["Partida Española"],
  },
  {
    slug: "capablanca",
    name: "José Raúl Capablanca",
    elo: 2668,
    country: "CUB",
    bio: "Campeón del mundo de 1921 a 1927. Finales limpios, casi sin errores.",
    openings: ["Gambito de Dama", "Partida Española"],
  },
  {
    slug: "alekhine",
    name: "Alexander Alekhine",
    elo: 2646,
    country: null,
    bio: "Campeón del mundo de 1927 a 1935 y de 1937 a 1946.",
    openings: ["Defensa Alekhine"],
  },
  {
    slug: "euwe",
    name: "Max Euwe",
    elo: 2538,
    country: "NED",
    bio: "Campeón del mundo de 1935 a 1937.",
    openings: ["Gambito de Dama"],
  },
  {
    slug: "botvinnik",
    name: "Mijaíl Botvínnik",
    elo: 2628,
    country: null,
    bio: "Campeón del mundo de 1948 a 1963, con dos pausas.",
    openings: ["Defensa Francesa"],
  },
  {
    slug: "smyslov",
    name: "Vasili Smyslov",
    elo: 2603,
    country: null,
    bio: "Campeón del mundo de 1957 a 1958.",
    openings: ["Partida Española"],
  },
  {
    slug: "tal",
    name: "Mijaíl Tal",
    elo: 2694,
    country: null,
    bio: "El mago de Riga, campeón del mundo de 1960 a 1961. Sacrifica piezas que nadie más sacrificaría.",
    openings: ["Defensa Siciliana"],
  },
  {
    slug: "petrosian",
    name: "Tigran Petrosián",
    elo: 2639,
    country: null,
    bio: "Campeón del mundo de 1963 a 1969.",
    openings: ["Defensa Francesa"],
  },
  {
    slug: "spassky",
    name: "Boris Spassky",
    elo: 2657,
    country: null,
    bio: "Campeón del mundo de 1969 a 1972.",
    openings: ["Partida Española"],
  },
  {
    slug: "fischer",
    name: "Bobby Fischer",
    elo: 2763,
    country: "USA",
    bio: "Campeón del mundo de 1972 a 1975.",
    openings: ["Siciliana Najdorf"],
  },
  {
    slug: "karpov",
    name: "Anatoli Kárpov",
    elo: 2737,
    country: null,
    bio: "Campeón del mundo de 1975 a 1985.",
    openings: ["Caro-Kann"],
  },
  {
    slug: "kasparov",
    name: "Garri Kaspárov",
    elo: 2786,
    country: null,
    bio: "Campeón del mundo de 1985 a 2000.",
    openings: ["Siciliana Najdorf"],
  },
  {
    slug: "kramnik",
    name: "Vladímir Krámnik",
    elo: 2753,
    country: null,
    bio: "Campeón del mundo de 2000 a 2007.",
    openings: ["Defensa Berlinesa"],
  },
  {
    slug: "anand",
    name: "Viswanathan Anand",
    elo: 2749,
    country: "IND",
    bio: "Campeón del mundo de 2007 a 2013.",
    openings: ["Partida Española"],
  },
  {
    slug: "ding-liren",
    name: "Ding Liren",
    elo: 2716,
    country: "CHN",
    bio: "Campeón del mundo de 2023 a 2024.",
    openings: ["Partida Catalana"],
  },
]);

const ACTIVE = group(BOT_GROUP.ACTIVE, [
  {
    slug: "carlsen",
    name: "Magnus Carlsen",
    elo: 2798,
    country: "NOR",
    bio: "Campeón del mundo de 2013 a 2023. El rival más fuerte de la plataforma.",
    openings: ["De todo"],
  },
  {
    slug: "nakamura",
    name: "Hikaru Nakamura",
    elo: 2779,
    country: "USA",
    bio: "Especialista en partidas rápidas.",
    openings: ["Defensa Nimzoindia"],
  },
  {
    slug: "caruana",
    name: "Fabiano Caruana",
    elo: 2774,
    country: "USA",
    bio: "Retó a Carlsen por el título en 2018.",
    openings: ["Defensa Petrov"],
  },
  {
    slug: "gukesh",
    name: "Gukesh D",
    elo: 2757,
    country: "IND",
    bio: "Campeón del mundo en 2024, a los 18 años.",
    openings: ["Partida Española"],
  },
  {
    slug: "polgar",
    name: "Judit Polgár",
    elo: 2689,
    country: "HUN",
    bio: "La mejor jugadora de la historia; llegó al top 10 mundial.",
    openings: ["Defensa Siciliana"],
  },
  {
    slug: "hou-yifan",
    name: "Hou Yifan",
    elo: 2641,
    country: "CHN",
    bio: "Cuatro veces campeona del mundo femenina.",
    openings: ["Partida Española"],
  },
]);

/** Every bot, group by group in the order «Jugar» shows them. */
export const BOT_ROSTER: readonly BotSeed[] = [
  ...CHARACTERS,
  ...MEXICO_OPEN,
  ...MEXICO_WOMEN,
  ...MEXICO_LEGENDS,
  ...WORLD_CHAMPIONS,
  ...ACTIVE,
];

/** A bot by its slug. */
export function botSeedOf(slug: string): BotSeed | undefined {
  return BOT_ROSTER.find((bot) => bot.slug === slug);
}
