import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { ListOlIcon } from "@/components/icons/list-ol-icon.comp";
import { EditGame } from "@/components/platform/shared/edit-game/edit-game.comp";
import { updateGameDetails } from "@/services/studies/studies.actions";
import type { GameView, StudyKindOption } from "@/services/studies/studies.types";
import "./game-record.comp.css";

interface GameRecordProps {
  game: GameView;
  /** Results from the catalog, for the edit dialog. Empty when the game is not the viewer's to edit. */
  results: StudyKindOption[];
}

/**
 * Where and when the game was played, in one line under its event: the
 * round, the date and the place, whichever of them the game has.
 */
function contextOf(game: GameView): string[] {
  return [game.round ? `Ronda ${game.round}` : undefined, game.playedAtLabel, game.site].filter(
    (part): part is string => Boolean(part),
  );
}

/**
 * The record of the game on the board, in the column of its study. The
 * event is its title; under it, in one line, the round, the date and the
 * place; and what was played — the opening's code, how many moves — in pills
 * with an icon each.
 *
 * Only what the game HAS is drawn: a fact that is missing takes no place, so
 * the card is as tall as its game is documented. The result is not here: the
 * list of games and the players' strips already say it. Neither is deleting
 * the game, which is in its settings, behind the gear of its row.
 *
 * It is the page's and not the layout's — the one card of that column that is
 * about the current game —, so it is the one that changes from game to game
 * while the study above it holds still (`StudyAside`). It decides for itself
 * what the viewer may do, from `game.canEdit`. A Server Component: the modal
 * it mounts is a Client Component with its own state.
 */
export function GameRecord({ game, results }: GameRecordProps) {
  const context = contextOf(game);
  const hasFacts = Boolean(game.eco) || game.moveCount > 0;
  const isEmpty = !game.event && context.length === 0 && !hasFacts;

  return (
    <section className="game-record">
      <div className="game-record__head">
        <p className="game-record__label">Datos de la partida</p>
        {game.canEdit && (
          /* The whole record, without going field by field: `GameView` already
             contains every field of `GameFieldValues`, and listing them here is
             how the title and the federation got lost once — the form asked for
             them and this list did not pass them, so saving erased them. */
          <EditGame
            action={updateGameDetails.bind(null, game.studyId, game.id)}
            results={results}
            values={game}
            titleHint="Cómo identificas esta partida dentro del estudio. Si lo dejas vacío se usan los dos jugadores."
            trigger="icon"
          />
        )}
      </div>

      {game.event && <p className="game-record__event">{game.event}</p>}
      {context.length > 0 && <p className="game-record__context">{context.join(" · ")}</p>}

      {hasFacts && (
        <ul className="game-record__facts">
          {game.eco && (
            <li className="game-record__fact">
              <BookOpenIcon className="game-record__fact-icon" />
              {/* The icon says it to the eye; the words, to a screen reader. */}
              <span className="game-record__sr">Apertura, código ECO: </span>
              {game.eco}
            </li>
          )}
          {game.moveCount > 0 && (
            <li className="game-record__fact">
              <ListOlIcon className="game-record__fact-icon" />
              {game.moveCount} {game.moveCount === 1 ? "jugada" : "jugadas"}
            </li>
          )}
        </ul>
      )}

      {isEmpty && <p className="game-record__context">Esta partida aún no tiene datos.</p>}
    </section>
  );
}

/**
 * The record's card, blank, while the next game of the study arrives: it
 * keeps the record's place under the study, so the column does not close up
 * and open again from one game to the next.
 */
export function GameRecordSkeleton() {
  return <div className="game-record game-record_state_loading" aria-hidden="true" />;
}
