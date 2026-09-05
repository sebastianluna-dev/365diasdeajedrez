"use client";

import { useCallback, useMemo } from "react";
import { reviewGame, type PlayerReview } from "@/lib/chess/game-review";
import { parseEditableGame, serializeGame, setEvaluation } from "@/lib/chess/pgn-edit";
import { parsePgnTree, type MoveEvaluation } from "@/lib/chess/pgn-tree";
import { GameReviewChart } from "./game-review-chart.comp";
import { mainlineEvaluations, mainlinePaths, mainlinePositions } from "./mainline-positions";
import { useGameReview } from "./use-game-review";
import "./game-review.comp.css";

interface GameReviewProps {
  pgn: string;
  /** Sin permiso de escritura se puede evaluar, pero no se guarda. */
  canEdit: boolean;
  white: string;
  black: string;
  /** Ruta punteada de la jugada del tablero, para el cursor de la gráfica. */
  currentPath: string;
  onSelectPath: (path: string) => void;
  onPgnChange: (pgn: string) => void;
}

/**
 * La partida vista de una pieza: gráfica de ventaja y cómo de bien jugó cada
 * uno.
 *
 * No hay estado de «ya evaluada»: la evaluación vive DENTRO del PGN, un
 * `[%eval]` por jugada, así que si está, se pinta. Eso la hace sobrevivir a
 * recargar la página y viajar con la partida al exportarla.
 */
export function GameReview({
  pgn,
  canEdit,
  white,
  black,
  currentPath,
  onSelectPath,
  onPgnChange,
}: GameReviewProps) {
  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
  const evaluations = useMemo(() => (tree ? mainlineEvaluations(tree) : null), [tree]);
  const review = useMemo(() => (tree ? reviewGame(mainlinePositions(tree)) : null), [tree]);
  const paths = useMemo(() => (tree ? mainlinePaths(tree) : []), [tree]);

  /** Al terminar, las evaluaciones se escriben en el PGN y suben a guardarse. */
  const onFinished = useCallback(
    (results: MoveEvaluation[]) => {
      const game = parseEditableGame(pgn);
      const current = parsePgnTree(pgn);
      if (!game || !current) return;

      // Las rutas se recalculan del PGN de AHORA: si se editó algo mientras el
      // motor trabajaba, lo que sobra se descarta en vez de escribirse encima.
      const targets = mainlinePaths(current);
      results.forEach((evaluation, index) => {
        const path = targets[index];
        if (path !== undefined) setEvaluation(game, path, evaluation);
      });

      onPgnChange(serializeGame(game));
    },
    [pgn, onPgnChange],
  );

  const runner = useGameReview({ onFinished });
  const moveCount = Math.max(0, paths.length - 1);

  if (runner.state === "running") {
    const percent = runner.total > 0 ? Math.round((runner.done / runner.total) * 100) : 0;

    return (
      <div className="game-review">
        <div className="game-review__head">
          <span className="game-review__title">Analizando</span>
          <span className="game-review__percent">{percent}%</span>
        </div>

        <div className="game-review__track">
          <span className="game-review__bar" style={{ width: `${percent}%` }} />
        </div>

        <div className="game-review__foot">
          <span className="game-review__note">
            Posición {runner.done} de {runner.total}
          </span>
          <button type="button" className="game-review__cancel" onClick={runner.cancel}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (!evaluations || !review) {
    return (
      <div className="game-review">
        <span className="game-review__title">Evaluar la partida completa</span>
        <p className="game-review__lead">
          El módulo analiza cada posición de la línea principal y devuelve la gráfica de ventaja, la precisión de
          cada jugador y en qué jugadas se decidió.
        </p>

        <button
          type="button"
          disabled={moveCount === 0}
          className="game-review__start"
          onClick={() => runner.start(pgn)}
        >
          Generar evaluación
        </button>

        <div className="game-review__foot">
          <span className="game-review__note">
            {moveCount === 0 ? "Esta partida todavía no tiene jugadas." : `${moveCount} jugadas`}
          </span>
          <span className="game-review__note">Profundidad {runner.depth}</span>
        </div>

        {runner.state === "failed" && (
          <p className="game-review__error" role="alert">
            No se pudo cargar el módulo en este navegador.
          </p>
        )}
      </div>
    );
  }

  const currentPly = Math.max(0, paths.indexOf(currentPath));

  return (
    <div className="game-review game-review_state_done">
      <div className="game-review__chart">
        <GameReviewChart
          evaluations={evaluations}
          review={review}
          currentPly={currentPly}
          onSelectPly={(ply) => onSelectPath(paths[ply] ?? "")}
        />
      </div>

      <div className="game-review__players">
        <PlayerCard name={white} side="white" player={review.white} />
        <PlayerCard name={black} side="black" player={review.black} />
      </div>

      <div className="game-review__foot game-review__foot_variant_strip">
        <span className="game-review__note">
          Profundidad {runner.depth} · {canEdit ? "guardada en la partida" : "no se guarda: la partida no es tuya"}
        </span>
        <button type="button" className="game-review__again" onClick={() => runner.start(pgn)}>
          Volver a evaluar
        </button>
      </div>
    </div>
  );
}

interface PlayerCardProps {
  name: string;
  side: "white" | "black";
  player: PlayerReview;
}

/** Lo que hizo un jugador: su precisión y en qué se le fue la partida. */
function PlayerCard({ name, side, player }: PlayerCardProps) {
  const rows = [
    { key: "inaccuracies", label: "Imprecisiones", value: player.inaccuracies },
    { key: "mistakes", label: "Errores", value: player.mistakes },
    { key: "blunders", label: "Errores graves", value: player.blunders },
  ];

  return (
    <div className="game-review__player">
      <div className="game-review__player-head">
        <span className={`game-review__chip game-review__chip_side_${side}`} aria-hidden="true" />
        <span className="game-review__player-name">{name}</span>
      </div>

      <p className="game-review__accuracy">
        <span className="game-review__accuracy-value">{player.accuracy}%</span>
        <span className="game-review__accuracy-label">precisión</span>
      </p>

      {rows.map((row) => (
        <div key={row.key} className="game-review__row">
          <span className={`game-review__dot game-review__dot_kind_${row.key}`} aria-hidden="true" />
          <span className="game-review__row-label">{row.label}</span>
          <span className="game-review__row-value">{row.value}</span>
        </div>
      ))}

      <div className="game-review__row game-review__row_variant_total">
        <span className="game-review__row-label">Pérdida media</span>
        <span className="game-review__row-value">{player.averageLoss} cp</span>
      </div>
    </div>
  );
}
