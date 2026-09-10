import { SearchIcon } from "@/components/icons/search-icon.comp";
import { staffRoutes } from "@/lib/platform-routes";
import { setLessonGame } from "@/services/staff-courses/staff-courses.actions";
import type { CourseGameRow } from "@/services/staff-courses/staff-courses.types";
import "./lesson-game-picker.comp.css";

interface LessonGamePickerProps {
  courseId: string;
  chapterId: string;
  lessonId: string;
  /** The linked game, if any. */
  game?: CourseGameRow;
  /** Those of the course collection that match the search. */
  candidates: CourseGameRow[];
  /** What was searched; travels in the URL so the server filters. */
  query?: string;
}

/**
 * Where the lesson gets its content from: a game of the course collection.
 *
 * Linking is not irreversible, which is why it is offered without ceremony:
 * the lesson's own PGN goes dormant and comes back on unlinking.
 *
 * The search box is a GET against the page itself, so it needs neither state
 * nor JavaScript: the search stays in the URL and the server returns the
 * already filtered list.
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
            {/* Without `gameId` the action unlinks. */}
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

  // With nothing to search the search box is not shown: a field that can
  // only return "there is nothing" is noise.
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
