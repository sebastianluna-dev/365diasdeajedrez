import type { BotScore } from "@/services/play/play.types";
import type { BotGroupView, BotView } from "./bots.types";

// Which bot «Jugar» suggests, as a pure function of the bots and the record.

export interface SuggestedBot {
  bot: BotView;
  /** The strongest bot already beaten, the one the suggestion comes after; null to start. */
  after: BotView | null;
}

/**
 * The first bot stronger than the strongest one already beaten; the weakest
 * of all to start with; and, once every bot has been beaten, the strongest.
 * A draw is not a win: it does not move the suggestion.
 */
export function suggestedBot(groups: readonly BotGroupView[], scores: readonly BotScore[]): SuggestedBot | null {
  const bots = groups.flatMap((group) => group.bots).sort((a, b) => a.elo - b.elo);
  if (bots.length === 0) return null;
  const beaten = new Set(scores.filter((score) => score.wins > 0).map((score) => score.botId));
  const strongestBeaten = bots.filter((bot) => beaten.has(bot.id)).at(-1) ?? null;
  if (!strongestBeaten) return { bot: bots[0]!, after: null };
  const next = bots.find((bot) => bot.elo > strongestBeaten.elo);
  return { bot: next ?? bots.at(-1)!, after: strongestBeaten };
}

/** «De 412 a 1868»: a group's span of labels. */
export function eloSpanOf(group: BotGroupView): string {
  const elos = group.bots.map((bot) => bot.elo);
  const [low, high] = [Math.min(...elos), Math.max(...elos)];
  return low === high ? `${low}` : `De ${low} a ${high}`;
}
