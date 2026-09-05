import { SearchIcon } from "@/components/icons/search-icon.comp";
import { staffRoutes } from "@/lib/platform-routes";
import { setLessonGame } from "@/services/staff-courses/staff-courses.actions";
import type { CourseGameRow } from "@/services/staff-courses/staff-courses.types";
import "./lesson-game-picker.comp.css";

interface LessonGamePickerProps {
  courseId: string;
  chapterId: string;
  lessonId: string;
  /** La partida vinculada, si la hay. */
  game?: CourseGameRow;
  /** Las de la colección del curso que casan con la búsqueda. */
  candidates: CourseGameRow[];
  /** Lo que se buscó; viaja en la URL para que el servidor filtre. */
  query?: string;
}

/**
 * De dónde saca la lección su contenido: una partida de la colección del curso.
 *
 * Vincular no es irreversible y por eso se ofrece sin ceremonia: el PGN propio
 * de la lección se queda dormido y vuelve al desvincular.
 *
 * El buscador es un GET contra la propia página, así que no necesita estado ni
 * JavaScript: la búsqueda queda en la URL y el servidor devuelve la lista ya
 * filtrada.
 */
export function LessonGamePicker({
  courseId,
  chapterId,
  lessonId,
  game,
  candidates,
  query,
}: LessonGamePickerProps) {
  const save = setLessonGame.bind(null, courseId, chapterId, lessonId);

  if (game) {
    return (
      <div className="lesson-game-picker">
        <div className="lesson-game-picker__current">
          <span className="lesson-game-picker__text">
            <span className="lesson-game-picker__title">{game.title}</span>
            <span className="lesson-game-picker__detail">
              {game.detail}
              {game.detail && " · "}
              {game.moveCount} jugadas
            </span>
          </span>

          <form action={save}>
            {/* Sin `gameId` la acción desvincula. */}
            <button type="submit" className="lesson-game-picker__change">
              Desvincular
            </button>
          </form>
        </div>

        <p className="lesson-game-picker__note">
          El contenido de la lección es el de esta partida. Corrígela en la colección del curso y quedan
          corregidas todas las lecciones que la usan.
        </p>
      </div>
    );
  }

  // Sin nada que buscar no se enseña el buscador: un campo que sólo puede
  // devolver «no hay nada» es ruido.
  if (candidates.length === 0 && !query) {
    return (
      <p className="lesson-game-picker__note">
        Este curso todavía no tiene partidas en su colección. Añádelas en la ficha del curso —ahí es donde se
        pega el PGN— y luego vuelve a elegir una aquí.
      </p>
    );
  }

  return (
    <div className="lesson-game-picker">
      <form className="lesson-game-picker__search" action={staffRoutes.lessonDetail(courseId, chapterId, lessonId)}>
        <SearchIcon className="lesson-game-picker__search-icon" />
        <input
          type="search"
          name="partida"
          defaultValue={query ?? ""}
          className="lesson-game-picker__search-input"
          placeholder="Buscar en la colección: jugadores, evento, apertura"
          aria-label="Buscar una partida de la colección del curso"
        />
      </form>

      {candidates.length > 0 ? (
        <ul className="lesson-game-picker__list">
          {candidates.map((candidate) => (
            <li key={candidate.id} className="lesson-game-picker__row">
              <span className="lesson-game-picker__text">
                <span className="lesson-game-picker__title">{candidate.title}</span>
                <span className="lesson-game-picker__detail">
                  {candidate.detail}
                  {candidate.detail && " · "}
                  {candidate.moveCount} jugadas
                  {candidate.lessonCount > 0 &&
                    ` · en ${candidate.lessonCount} ${candidate.lessonCount === 1 ? "lección" : "lecciones"}`}
                </span>
              </span>

              <form action={save}>
                <input type="hidden" name="gameId" value={candidate.id} />
                <button type="submit" className="lesson-game-picker__link">
                  Vincular
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="lesson-game-picker__note">
          {query
            ? "No hay partidas que coincidan."
            : "Este curso todavía no tiene partidas en su colección. Añádelas en la ficha del curso."}
        </p>
      )}
    </div>
  );
}
