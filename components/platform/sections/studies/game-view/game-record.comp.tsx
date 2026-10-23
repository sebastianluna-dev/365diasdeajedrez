import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { ListOlIcon } from "@/components/icons/list-ol-icon.comp";
import { EditGame } from "@/components/platform/shared/edit-game/edit-game.comp";
import { openingOfEco } from "@/lib/chess/eco-openings";
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
 * The record of the game on the board, at the head of the panel, in the new
 * design system (2026-10-23): an outlined card over the board. The event is
 * its title, in the display font; under it, in one line, the round, the date and the
 * place; and what was played — the opening, by its code and its name, and
 * how many moves — in pills with an icon each.
 *
 * Only what the game HAS is drawn: a fact that is missing takes no place, so
 * the card is as tall as its game is documented. The result is not here: the
 * list of games and the players' strips already say it. Neither is deleting
 * the game, which is in its settings, behind the gear of its row.
 *
 * It is the page's and not the layout's — the one card about the current
 * game besides the board —, so it changes from game to game while the
 * study's column holds still (`StudyAside`). It decides for itself
 * what the viewer may do, from `game.canEdit`. A Server Component: the modal
 * it mounts is a Client Component with its own state.
 */
export function GameRecord({ game, results }: GameRecordProps) {
  const context = contextOf(game);
  // Read from the code and not stored: the name cannot disagree with it.
  const opening = game.eco ? openingOfEco(game.eco) : undefined;
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
            look="material"
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
              {/* One run of text, so a long name wraps inside the pill. */}
              <span className="game-record__fact-text">
                {game.eco}
                {opening && <span className="game-record__opening"> · {opening}</span>}
              </span>
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
