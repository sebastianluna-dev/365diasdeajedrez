import Link from "next/link";
import { PlayerAvatar } from "@/components/chess/player-avatar/player-avatar.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { OpenGameSummary } from "@/services/play/play.types";
import "./open-game-notice.comp.css";

/**
 * «Tienes una partida en curso contra Beto», with «Continuar»: a game against
 * a bot has no clock, so it waits where it was left until it is resumed or
 * replaced.
 */
export function OpenGameNotice({ game }: { game: OpenGameSummary }) {
  const moves = Math.ceil(game.plyCount / 2);
  return (
    <section className="open-game-notice" aria-label="Partida en curso">
      <PlayerAvatar {...game.rival.avatar} size="md" />
      <div className="open-game-notice__text">
        <span className="open-game-notice__title">Tienes una partida en curso contra {game.rival.name}</span>
        <span className="open-game-notice__meta">
          Con {game.color === "white" ? "blancas" : "negras"} ·{" "}
          {moves === 0 ? "sin jugadas todavía" : `${moves} ${moves === 1 ? "jugada" : "jugadas"}`}
        </span>
      </div>
      <Link href={platformRoutes.playedGame(game.id)} className="platform-button platform-button_variant_accent">
        Continuar
        <ChevronRightIcon variant="classic-solid" className="platform-button__icon" />
      </Link>
    </section>
  );
}
