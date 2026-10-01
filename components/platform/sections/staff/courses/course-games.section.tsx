import Link from "next/link";
import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { staffRoutes } from "@/lib/platform-routes";
import type { CourseAdminDetail, CourseGameRow } from "@/services/staff-courses/staff-courses.types";
import { StaffPanel } from "./staff-panel.comp";
import "./course-games.section.css";

interface CourseGamesSectionProps {
  course: CourseAdminDetail;
  games: CourseGameRow[];
}

/**
 * Every game of the course, at once. The list itself is read-only: games
 * are added and removed from the chapter they belong to — a game without a
 * chapter would have no collection to go to —, and each one opens on the
 * board of its chapter, where it is read and edited. It is the overview that
 * the split by chapters would take away if it did not exist.
 */
export function CourseGamesSection({ course, games }: CourseGamesSectionProps) {
  return (
    <div className="course-games">
      <StaffPanel
        title="Partidas del curso"
        meta={`${games.length}`}
        description="Todas las de sus capítulos. Cada una se abre en el tablero para verla y editarla; se agregan y se quitan desde el capítulo al que pertenecen."
      >
        {games.length > 0 ? (
          <div className="course-games__table">
            <div className="course-games__head" aria-hidden="true">
              <span>Partida</span>
              <span>Capítulo</span>
              <span className="course-games__number">Jugadas</span>
              <span>En uso</span>
            </div>

            <ul className="course-games__rows">
              {games.map((game) => (
                <li key={game.id} className="course-games__row">
                  <span className="course-games__text">
                    {game.href ? (
                      <Link href={game.href} className="course-games__title">
                        {game.title}
                      </Link>
                    ) : (
                      <span className="course-games__title">{game.title}</span>
                    )}
                    {game.detail && <span className="course-games__detail">{game.detail}</span>}
                  </span>

                  <span className="course-games__cell">{game.chapterName ?? "—"}</span>
                  <span className="course-games__cell course-games__number">{game.moveCount}</span>
                  <span className="course-games__cell">
                    {game.lessonCount > 0
                      ? `${game.lessonCount} ${game.lessonCount === 1 ? "lección" : "lecciones"}`
                      : "Sin usar"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState
            title="Ningún capítulo tiene partidas todavía"
            description="Se pegan desde el capítulo: sus lecciones sólo pueden usar partidas de su propia colección."
          />
        )}
      </StaffPanel>

      <p className="course-games__note">
        Para agregar o quitar, entra en su capítulo desde{" "}
        <Link href={staffRoutes.courseDetail(course.id)} className="course-games__link">
          la ficha del curso
        </Link>
        .
      </p>
    </div>
  );
}
