import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state.comp";
import { staffRoutes } from "@/lib/platform-routes";
import type { CourseAdminDetail, CourseGameRow } from "@/services/staff-courses/staff-courses.types";
import { StaffEditorHead } from "./staff-editor.comp";
import { StaffPanel } from "./staff-panel.comp";
import { StaffTabs } from "./staff-tabs.comp";
import "./course-games.section.css";

interface CourseGamesSectionProps {
  course: CourseAdminDetail;
  games: CourseGameRow[];
}

/**
 * Todas las partidas del curso, de una vez y de SÓLO LECTURA.
 *
 * Se añaden y se quitan desde el capítulo al que pertenecen —una partida sin
 * capítulo no tendría colección a la que ir—, así que aquí sólo se miran y se
 * salta a su capítulo. Es la vista de conjunto que el reparto por capítulos
 * quitaría de en medio si no existiera.
 */
export function CourseGamesSection({ course, games }: CourseGamesSectionProps) {
  return (
    <div className="course-games">
      <StaffEditorHead
        crumbs={[{ label: "Cursos", href: staffRoutes.courses }]}
        title={course.name}
        badge={
          <span className={`course-games__status course-games__status_state_${course.statusCode.toLowerCase()}`}>
            {course.statusLabel}
          </span>
        }
      />

      <StaffTabs
        current={staffRoutes.courseGames(course.id)}
        tabs={[
          { label: "Curso", href: staffRoutes.courseDetail(course.id) },
          { label: "Partidas", href: staffRoutes.courseGames(course.id), count: games.length },
        ]}
      />

      <StaffPanel
        title="Partidas del curso"
        meta={`${games.length}`}
        description="Todas las de sus capítulos. Se añaden y se quitan desde el capítulo al que pertenecen; aquí sólo se consultan."
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
                    <span className="course-games__title">{game.title}</span>
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
        Para añadir o quitar, entra en su capítulo desde{" "}
        <Link href={staffRoutes.courseDetail(course.id)} className="course-games__link">
          la ficha del curso
        </Link>
        .
      </p>
    </div>
  );
}
