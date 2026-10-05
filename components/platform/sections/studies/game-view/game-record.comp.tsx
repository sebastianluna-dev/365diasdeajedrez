import { EditGame } from "@/components/platform/shared/edit-game/edit-game.comp";
import { updateGameDetails } from "@/services/studies/studies.actions";
import type { GameView, StudyKindOption } from "@/services/studies/studies.types";
import { DeleteGame } from "./delete-game.comp";
import "./game-record.comp.css";

interface GameRecordProps {
  game: GameView;
  /** Results from the catalog, for "Editar". Empty when the game is not the viewer's to edit. */
  results: StudyKindOption[];
}

/**
 * The four short facts, in a grid.
 *
 * All four are ALWAYS rendered, with a dash where there is no value: in a
 * two-by-two grid, hiding one cell displaces the other three, and an
 * incomplete record reads worse than one with declared gaps.
 */
function recordCells(game: GameView): { key: string; value: string }[] {
  return [
    { key: "Fecha", value: game.playedAtLabel ?? "—" },
    { key: "Ronda", value: game.round ?? "—" },
    { key: "ECO", value: game.eco ?? "—" },
    { key: "Resultado", value: game.resultLabel },
  ];
}

/**
 * The record of the game on the board, in the column of its study: where it
 * was played, when and how it ended, and at the foot where the game came from.
 *
 * It is the page's and not the layout's — the one card of that column that is
 * about the current game —, so it is the one that changes from game to game
 * while the study above it holds still (`StudyAside`). It decides for itself
 * what the viewer may do, from `game.canEdit`. A Server Component: the two
 * modals it mounts are Client Components with their own state.
 */
export function GameRecord({ game, results }: GameRecordProps) {
  const cells = recordCells(game);

  return (
    <section className="game-record">
      <div className="game-record__head">
        <div className="game-record__title">
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
            />
          )}
        </div>

        {game.event && <p className="game-record__event">{game.event}</p>}
        {game.site && <p className="game-record__site">{game.site}</p>}
      </div>

      <dl className="game-record__cells">
        {cells.map((cell) => (
          <div key={cell.key} className="game-record__cell">
            <dt className="game-record__key">{cell.key}</dt>
            <dd className="game-record__value">{cell.value}</dd>
          </div>
        ))}
      </dl>

      {/* Where it came from and, for the owner, deleting it: the moves are edited
          on the board itself, so nothing else is left here. */}
      <div className="game-record__foot">
        <span className="game-record__source">{game.sourceLabel}</span>
        {game.canEdit && (
          <DeleteGame
            studyId={game.studyId}
            gameId={game.id}
            name={game.title ?? `${game.white} – ${game.black}`}
            classBlockCount={game.classBlockCount}
            size="inline"
            label="Eliminar"
          />
        )}
      </div>
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
