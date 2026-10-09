import Link from "next/link";
import { PlayedGameCard } from "@/components/platform/shared/played-game-card/played-game-card.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { PlayedGameCard as PlayedGameCardData } from "@/services/play/play.types";
import "./student-played-games-card.comp.css";

interface StudentPlayedGamesCardProps {
  /** The student's user name: their profile. */
  slug: string;
  /** Their last games, the most recent first. */
  games: PlayedGameCardData[];
}

/**
 * «Partidas jugadas» on the teacher's page of a student (planning decision
 * §K): the last eight games against the bots, each opening read-only, and
 * the way to the student's profile, where the rest are.
 */
export function StudentPlayedGamesCard({ slug, games }: StudentPlayedGamesCardProps) {
  return (
    <section className="platform-card student-played-games">
      <header className="student-played-games__head">
        <h2 className="platform-card__title">Partidas jugadas</h2>
        <Link href={platformRoutes.userProfile(slug)} className="student-played-games__profile">
          Ver su perfil
        </Link>
      </header>
      {games.length === 0 ? (
        <p className="student-played-games__empty">Este alumno todavía no ha jugado contra los bots.</p>
      ) : (
        <ul className="student-played-games__grid">
          {games.map((game) => (
            <li key={game.id}>
              <PlayedGameCard game={game} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
