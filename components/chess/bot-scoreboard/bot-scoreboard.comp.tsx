import { PlayerAvatar } from "@/components/chess/player-avatar/player-avatar.comp";
import type { PlayerAvatarData } from "@/lib/avatar-tone";
import "./bot-scoreboard.comp.css";

/** One side of the scoreboard: who, and their portrait. */
export interface ScoreboardSide {
  name: string;
  avatar: PlayerAvatarData;
  /** A bot's label, shown as «≈ 783»; none for the person. */
  elo?: number;
}

export interface BotScoreboardProps {
  you: ScoreboardSide;
  rival: ScoreboardSide;
  wins: number;
  losses: number;
  draws: number;
}

/** «1 tabla», «3 tablas». */
const drawsText = (draws: number) => `${draws} ${draws === 1 ? "tabla" : "tablas"}`;

/**
 * The record against one rival, as a match's scoreboard (H6): you and the
 * rival with your portraits and «2 – 1» large between them, the draws small
 * underneath. Only finished games with a result count (`countsForScore`).
 */
export function BotScoreboard({ you, rival, wins, losses, draws }: BotScoreboardProps) {
  const played = wins + losses + draws;
  return (
    <div
      className="bot-scoreboard"
      role="group"
      aria-label={`Marcador contra ${rival.name}: ${wins} ganadas, ${losses} perdidas, ${drawsText(draws)}`}
    >
      <div className="bot-scoreboard__side">
        <PlayerAvatar {...you.avatar} size="lg" />
        <span className="bot-scoreboard__name">{you.name}</span>
      </div>

      <div className="bot-scoreboard__score" aria-hidden="true">
        <span className="bot-scoreboard__figures">
          <span className="bot-scoreboard__figure">{wins}</span>
          <span className="bot-scoreboard__dash">–</span>
          <span className="bot-scoreboard__figure">{losses}</span>
        </span>
        <span className="bot-scoreboard__draws">{played === 0 ? "Primera partida" : drawsText(draws)}</span>
      </div>

      <div className="bot-scoreboard__side">
        <PlayerAvatar {...rival.avatar} size="lg" />
        <span className="bot-scoreboard__name">
          {rival.name}
          {rival.elo !== undefined && <span className="bot-scoreboard__elo"> ≈ {rival.elo}</span>}
        </span>
      </div>
    </div>
  );
}
