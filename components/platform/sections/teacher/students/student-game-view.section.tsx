import Link from "next/link";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import type { GameView } from "@/services/studies/studies.types";
import type { TeacherClassSummary } from "@/services/teacher-classes/teacher-classes.types";
import "./student-game-view.section.css";

interface StudentGameViewSectionProps {
  studentId: string;
  studentName: string;
  game: GameView;
  /** The teacher's scheduled classes: destinations of "Usar en una clase". */
  scheduledClasses: TeacherClassSummary[];
}

/**
 * A student's game seen by their teacher. Read-only: "Usar en una clase"
 * copies and modifies nothing, it leads to the block editor of one of the
 * teacher's own classes with the game preselected, and it is there that the
 * server re-checks that the assignment is still active before inserting the block.
 */
export function StudentGameViewSection({
  studentId,
  studentName,
  game,
  scheduledClasses,
}: StudentGameViewSectionProps) {
  return (
    <section className="student-game">
      <nav className="student-game__breadcrumb" aria-label="Ruta del alumno">
        <Link href={teacherRoutes.students} className="student-game__breadcrumb-link">
          Mis alumnos
        </Link>
        <span className="student-game__breadcrumb-separator">/</span>
        <Link href={teacherRoutes.studentDetail(studentId)} className="student-game__breadcrumb-link">
          {studentName}
        </Link>
        <span className="student-game__breadcrumb-separator">/</span>
        <Link href={game.studyHref} className="student-game__breadcrumb-link">
          {game.studyName}
        </Link>
      </nav>

      <header className="student-game__head">
        <h1 className="platform-page__title">
          {game.white}
          {game.whiteElo ? ` (${game.whiteElo})` : ""} – {game.black}
          {game.blackElo ? ` (${game.blackElo})` : ""}
        </h1>
        <p className="platform-page__subtitle">
          {[game.event, game.site, game.playedAtLabel, game.eco, game.resultLabel].filter(Boolean).join(" · ")}
        </p>
      </header>

      <GameViewer pgn={game.pgn} />

      <div className="platform-card student-game__use">
        <h2 className="platform-card__title">Usar en una clase</h2>
        {scheduledClasses.length > 0 ? (
          <>
            <p className="student-game__use-hint">
              Se añadirá como bloque de partida (una referencia, no una copia) a la clase que elijas.
            </p>
            <ul className="student-game__use-list">
              {scheduledClasses.map((teacherClass) => (
                <li key={teacherClass.id}>
                  <Link
                    href={`${teacherRoutes.classDetail(teacherClass.id)}?gameId=${game.id}`}
                    className="platform-button platform-button_variant_secondary"
                  >
                    {teacherClass.title} · {teacherClass.dateLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="student-game__use-hint">
            No tienes clases programadas. <Link href={teacherRoutes.newClass}>Crea una</Link> para poder usar esta
            partida.
          </p>
        )}
      </div>

      <p className="student-game__source">Origen: {game.sourceLabel}</p>
    </section>
  );
}
