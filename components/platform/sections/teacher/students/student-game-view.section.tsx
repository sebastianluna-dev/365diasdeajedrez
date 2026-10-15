import Link from "next/link";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import type { GameView } from "@/services/studies/studies.types";
import type { UpcomingClassWith } from "@/services/teacher-classes/teacher-classes.types";
import "./student-game-view.section.css";

interface StudentGameViewSectionProps {
  /** Whose game it is: the subtitle says so, since nothing else on the screen does. */
  studentName: string;
  game: GameView;
  /** The teacher's classes ahead with this student: destinations of «Usar en una clase». */
  scheduledClasses: UpcomingClassWith[];
}

/**
 * A student's game seen by their teacher. Read-only: "Usar en una clase"
 * copies and modifies nothing, it leads to the block editor of one of the
 * teacher's own classes with the game preselected, and it is there that the
 * server re-checks that the assignment is still active before inserting the block.
 */
export function StudentGameViewSection({ studentName, game, scheduledClasses }: StudentGameViewSectionProps) {
  return (
    <section className="student-game">
      <header className="student-game__head">
        <h1 className="platform-page__title">
          {game.white}
          {game.whiteElo ? ` (${game.whiteElo})` : ""} – {game.black}
          {game.blackElo ? ` (${game.blackElo})` : ""}
        </h1>
        <p className="platform-page__subtitle">
          {[`Partida de ${studentName}`, game.event, game.site, game.playedAtLabel, game.eco, game.resultLabel]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      <GameViewer pgn={game.pgn} />

      <div className="platform-card student-game__use">
        <h2 className="platform-card__title">Usar en una clase</h2>
        {scheduledClasses.length > 0 ? (
          <>
            <p className="student-game__use-hint">
              Se agregará como bloque de partida (una referencia, no una copia) a la clase que elijas.
            </p>
            <ul className="student-game__use-list">
              {scheduledClasses.map((teacherClass) => (
                <li key={teacherClass.id}>
                  <Link href={`${teacherClass.href}?gameId=${game.id}`} className="platform-button">
                    {teacherClass.title} · {teacherClass.whenLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="student-game__use-hint">
            No tienes clases próximas con este alumno; las programa administración.
          </p>
        )}
      </div>

      <p className="student-game__source">Origen: {game.sourceLabel}</p>
    </section>
  );
}
