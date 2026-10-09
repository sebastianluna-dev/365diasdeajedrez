import type { MouseEvent } from "react";
import { PlayerAvatar } from "@/components/chess/player-avatar/player-avatar.comp";
import type { BotView } from "@/services/bots/bots.types";
import type { BotScore } from "@/services/play/play.types";
import "./bot-card.comp.css";

interface BotCardProps {
  bot: BotView;
  /** The person's record against it; none before the first game. */
  score: BotScore | null;
  /** Opens the bot's popup, from this card (the focus comes back to it on closing). */
  onPick: (event: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * A bot in the lobby's gallery (J1): its portrait with ring and flag, its
 * title if it has one, its name, «≈ 783» and the record against it. The whole
 * card is the button that opens its sheet.
 */
export function BotCard({ bot, score, onPick }: BotCardProps) {
  const played = score ? score.wins + score.losses + score.draws : 0;
  return (
    <button type="button" className="bot-card" onClick={onPick}>
      <PlayerAvatar {...bot.avatar} size="lg" />
      <span className="bot-card__name">
        {bot.fideTitle && <span className="bot-card__title">{bot.fideTitle}</span>}
        {bot.name}
      </span>
      <span className="bot-card__elo">
        <span className="bot-card__approx">≈</span> {bot.elo}
      </span>
      {played > 0 && score ? (
        <span
          className="bot-card__record"
          aria-label={`${score.wins} ganadas, ${score.losses} perdidas, ${score.draws} tablas`}
        >
          <span className="bot-card__wins">{score.wins} G</span>
          <span className="bot-card__losses">{score.losses} P</span>
          <span className="bot-card__draws">{score.draws} T</span>
        </span>
      ) : (
        <span className="bot-card__record bot-card__record_state_empty">
          {score?.open ? "Partida en curso" : "Sin partidas"}
        </span>
      )}
    </button>
  );
}
