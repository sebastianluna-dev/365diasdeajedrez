import { BotScoreboard } from "@/components/chess/bot-scoreboard/bot-scoreboard.comp";
import { PlayerAvatar } from "@/components/chess/player-avatar/player-avatar.comp";
import { BOT_GROUP_LABELS } from "@/constants/platform/play-codes.const";
import type { BotView } from "@/services/bots/bots.types";
import type { BotScore } from "@/services/play/play.types";
import type { PlayerCard } from "@/services/profile/profile.types";
import "./bot-sheet.comp.css";

interface BotSheetProps {
  bot: BotView;
  /** The person, for the scoreboard's other side. */
  you: PlayerCard;
  score: BotScore | null;
}

/**
 * Who a bot is, before playing it: its portrait, «Elo ≈ 783» (approximate
 * until calibrated), how it plays, its favourite openings, the facts of the
 * real player it is named after with the date they were true, and the
 * scoreboard against it (H6). It never claims to play like that person: it is
 * Stockfish, weakened.
 */
export function BotSheet({ bot, you, score }: BotSheetProps) {
  return (
    <div className="bot-sheet">
      <div className="bot-sheet__head">
        <PlayerAvatar {...bot.avatar} size="lg" />
        <div className="bot-sheet__who">
          <span className="bot-sheet__group">{BOT_GROUP_LABELS[bot.groupCode]}</span>
          <span className="bot-sheet__elo">Elo ≈ {bot.elo}</span>
        </div>
      </div>

      <p className="bot-sheet__bio">{bot.bio}</p>

      {bot.openings.length > 0 && (
        <p className="bot-sheet__fact">
          <span className="bot-sheet__label">Aperturas favoritas</span> {bot.openings.join(", ")}
        </p>
      )}
      {bot.fideElo !== null && (
        <p className="bot-sheet__fact">
          <span className="bot-sheet__label">Elo FIDE</span> {bot.fideTitle ? `${bot.fideTitle} · ` : ""}
          {bot.fideElo}
          {bot.ratingAsOfLabel && ` (${bot.ratingAsOfLabel})`}
        </p>
      )}

      <BotScoreboard
        you={you}
        rival={{ name: bot.name, avatar: bot.avatar, elo: bot.elo }}
        wins={score?.wins ?? 0}
        losses={score?.losses ?? 0}
        draws={score?.draws ?? 0}
        size="sm"
      />
    </div>
  );
}
