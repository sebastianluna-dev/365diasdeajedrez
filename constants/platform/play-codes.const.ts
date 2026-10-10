// Stable codes of «Jugar»: the games played on the platform, against a bot
// today and against a person later.

/**
 * How a played game ended. The board decides the first five, a person the
 * rest:
 *
 * - `RESIGNATION`: «Abandonar» was pressed; a loss for whoever pressed it.
 * - `ABANDONED`: a real game (two or more moves of one's own) left for a new
 *   one; a loss.
 * - `ABORTED`: closed before either side had played two moves; it has no
 *   result.
 * - `TIMEOUT` and `DRAW_AGREED`: only between people, with a clock; they exist
 *   from the start so that day needs no migration.
 */
export const GAME_TERMINATION = {
  CHECKMATE: "CHECKMATE",
  STALEMATE: "STALEMATE",
  INSUFFICIENT_MATERIAL: "INSUFFICIENT_MATERIAL",
  THREEFOLD_REPETITION: "THREEFOLD_REPETITION",
  FIFTY_MOVES: "FIFTY_MOVES",
  RESIGNATION: "RESIGNATION",
  ABANDONED: "ABANDONED",
  ABORTED: "ABORTED",
  TIMEOUT: "TIMEOUT",
  DRAW_AGREED: "DRAW_AGREED",
} as const;

export type GameTerminationCode = (typeof GAME_TERMINATION)[keyof typeof GAME_TERMINATION];

/** What each ending is called, as the catalog's label says it. */
export const GAME_TERMINATION_LABELS: Record<GameTerminationCode, string> = {
  CHECKMATE: "Jaque mate",
  STALEMATE: "Ahogado",
  INSUFFICIENT_MATERIAL: "Material insuficiente",
  THREEFOLD_REPETITION: "Triple repetición",
  FIFTY_MOVES: "Cincuenta jugadas",
  RESIGNATION: "Abandono",
  ABANDONED: "Abandonada",
  ABORTED: "Anulada",
  TIMEOUT: "Tiempo agotado",
  DRAW_AGREED: "Tablas acordadas",
};

/**
 * Where a bot belongs: one row each in «Jugar», in this order. A group that
 * is not listed (`BOT_GROUP_LISTED`) holds the rivals of an adventure: they
 * are not in the gallery and cannot be played from it.
 */
export const BOT_GROUP = {
  CHARACTERS: "CHARACTERS",
  MEXICO_OPEN: "MEXICO_OPEN",
  MEXICO_WOMEN: "MEXICO_WOMEN",
  MEXICO_LEGENDS: "MEXICO_LEGENDS",
  WORLD_CHAMPIONS: "WORLD_CHAMPIONS",
  ACTIVE: "ACTIVE",
  ADVENTURE_CUADERNO: "ADVENTURE_CUADERNO",
} as const;

export type BotGroupCode = (typeof BOT_GROUP)[keyof typeof BOT_GROUP];

/** What each group is called on screen. */
export const BOT_GROUP_LABELS: Record<BotGroupCode, string> = {
  CHARACTERS: "Personajes",
  MEXICO_OPEN: "Selección olímpica absoluta",
  MEXICO_WOMEN: "Selección olímpica femenil",
  MEXICO_LEGENDS: "Leyendas mexicanas",
  WORLD_CHAMPIONS: "Campeones del mundo",
  ACTIVE: "En activo",
  ADVENTURE_CUADERNO: "El cuaderno del viajero",
};

/**
 * Whether the gallery shows a group. The rivals of an adventure live in a
 * hidden group (`lib/adventure/adventures/*`): the gallery omits it and
 * `startPlayedGame`/`rematchPlayedGame` refuse its bots, so only the
 * adventure's own action can start a game against them, and only in order.
 */
export const BOT_GROUP_LISTED: Record<BotGroupCode, boolean> = {
  CHARACTERS: true,
  MEXICO_OPEN: true,
  MEXICO_WOMEN: true,
  MEXICO_LEGENDS: true,
  WORLD_CHAMPIONS: true,
  ACTIVE: true,
  ADVENTURE_CUADERNO: false,
};

/**
 * The ring around a bot's portrait, as a code and never as a colour: gold for
 * the world champions, the flag's three colours for Mexico's teams.
 */
export const BOT_RING = {
  NONE: "NONE",
  GOLD: "GOLD",
  TRICOLOR: "TRICOLOR",
} as const;

export type BotRingCode = (typeof BOT_RING)[keyof typeof BOT_RING];

/** Each group's ring. */
export const BOT_GROUP_RING: Record<BotGroupCode, BotRingCode> = {
  CHARACTERS: BOT_RING.NONE,
  MEXICO_OPEN: BOT_RING.TRICOLOR,
  MEXICO_WOMEN: BOT_RING.TRICOLOR,
  MEXICO_LEGENDS: BOT_RING.NONE,
  WORLD_CHAMPIONS: BOT_RING.GOLD,
  ACTIVE: BOT_RING.NONE,
  ADVENTURE_CUADERNO: BOT_RING.NONE,
};

export function isBotRingCode(value: string): value is BotRingCode {
  return Object.values(BOT_RING).includes(value as BotRingCode);
}

/**
 * How long each side has: `NONE` is the only one in use (against a bot there
 * is no clock); the rest are for games between people and are seeded
 * inactive, so switching one on is updating a row.
 */
export const TIME_CONTROL = {
  NONE: "NONE",
  BULLET_1_0: "BULLET_1_0",
  BULLET_2_1: "BULLET_2_1",
  BLITZ_3_0: "BLITZ_3_0",
  BLITZ_3_2: "BLITZ_3_2",
  BLITZ_5_0: "BLITZ_5_0",
  RAPID_10_0: "RAPID_10_0",
  RAPID_15_10: "RAPID_15_10",
  CLASSICAL_30_0: "CLASSICAL_30_0",
} as const;

export type TimeControlCode = (typeof TIME_CONTROL)[keyof typeof TIME_CONTROL];

/** Each time control's label and seconds; `initialSeconds` null is «without a clock». */
export const TIME_CONTROL_VALUES: readonly {
  code: TimeControlCode;
  label: string;
  initialSeconds: number | null;
  incrementSeconds: number;
  isActive: boolean;
}[] = [
  { code: TIME_CONTROL.NONE, label: "Sin tiempo", initialSeconds: null, incrementSeconds: 0, isActive: true },
  { code: TIME_CONTROL.BULLET_1_0, label: "1+0", initialSeconds: 60, incrementSeconds: 0, isActive: false },
  { code: TIME_CONTROL.BULLET_2_1, label: "2+1", initialSeconds: 120, incrementSeconds: 1, isActive: false },
  { code: TIME_CONTROL.BLITZ_3_0, label: "3+0", initialSeconds: 180, incrementSeconds: 0, isActive: false },
  { code: TIME_CONTROL.BLITZ_3_2, label: "3+2", initialSeconds: 180, incrementSeconds: 2, isActive: false },
  { code: TIME_CONTROL.BLITZ_5_0, label: "5+0", initialSeconds: 300, incrementSeconds: 0, isActive: false },
  { code: TIME_CONTROL.RAPID_10_0, label: "10+0", initialSeconds: 600, incrementSeconds: 0, isActive: false },
  { code: TIME_CONTROL.RAPID_15_10, label: "15+10", initialSeconds: 900, incrementSeconds: 10, isActive: false },
  { code: TIME_CONTROL.CLASSICAL_30_0, label: "30+0", initialSeconds: 1800, incrementSeconds: 0, isActive: false },
];
