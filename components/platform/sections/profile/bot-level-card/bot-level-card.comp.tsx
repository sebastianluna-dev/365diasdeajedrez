import { RobotIcon } from "@/components/icons/robot-icon.comp";
import { BOT_LEVEL_MIN_GAMES, BOT_LEVEL_WINDOW } from "@/services/play/play-rules";
import type { BotLevelSummary } from "@/services/play/play.types";
import { LevelSparkline } from "../level-sparkline/level-sparkline.comp";
import "./bot-level-card.comp.css";

interface BotLevelCardProps {
  level: BotLevelSummary;
  /** «tus» on one's own profile, «sus» on somebody else's. */
  isOwn: boolean;
}

/**
 * «Nivel contra bots ≈ 850» (N5): approximate, over the last ten finished
 * games against bots, with its sparkline. Under five games it says how many
 * are missing instead of a number nobody can trust. Never a rating.
 */
export function BotLevelCard({ level, isOwn }: BotLevelCardProps) {
  const missing = BOT_LEVEL_MIN_GAMES - level.sampleSize;
  return (
    <section className="bot-level-card" aria-labelledby="bot-level-card-title">
      <header className="bot-level-card__head">
        <RobotIcon className="bot-level-card__icon" />
        <h2 id="bot-level-card-title" className="bot-level-card__title">
          Nivel contra bots
        </h2>
      </header>
      {level.level !== null ? (
        <>
          <p className="bot-level-card__figure">≈ {level.level}</p>
          <p className="bot-level-card__note">
            Aproximado, sobre {isOwn ? "tus" : "sus"} últimas {Math.min(level.sampleSize, BOT_LEVEL_WINDOW)} partidas
          </p>
          <LevelSparkline points={level.series} />
        </>
      ) : (
        <p className="bot-level-card__note">
          {level.sampleSize === 0
            ? `Aparece después de ${BOT_LEVEL_MIN_GAMES} partidas terminadas contra bots.`
            : `Faltan ${missing} ${missing === 1 ? "partida terminada" : "partidas terminadas"} para calcularlo.`}
        </p>
      )}
    </section>
  );
}
