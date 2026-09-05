"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseEngineInfo } from "@/lib/chess/engine-protocol";
import type { MoveEvaluation } from "@/lib/chess/pgn-tree";
import { replayGame, turnColor } from "@/lib/chess/replay";

// Evaluar la partida ENTERA: una pasada del módulo por cada posición de la
// línea principal.
//
// Worker propio, aparte del de `use-engine.ts`. No es por comodidad: ése
// persigue la posición en la que está el usuario y va parando y relanzando la
// búsqueda; meter en esa conversación una segunda tanda de posiciones es
// exactamente lo que hace abortar a Stockfish (ver el comentario largo de aquel
// archivo). Dos tareas distintas, dos motores.
//
// El recorrido es en serie y por turnos: `position` + `go`, se apunta la última
// puntuación que dé y NO se pasa a la siguiente hasta su `bestmove`.

/**
 * Hasta dónde baja en cada posición.
 *
 * Dieciséis y no los veinte del análisis en vivo: aquí son sesenta posiciones
 * seguidas, y a veinte una partida larga se va a varios minutos de espera con
 * el ventilador a tope. A dieciséis, los errores de bulto salen igual.
 */
const REVIEW_DEPTH = 16;

export type GameReviewState = "idle" | "running" | "failed";

export interface GameReviewProgress {
  state: GameReviewState;
  /** Posiciones ya evaluadas y cuántas son en total. */
  done: number;
  total: number;
  /** La profundidad a la que se está analizando, para poder decirlo. */
  depth: number;
}

interface Options {
  /**
   * Se llama UNA vez al terminar, con la evaluación de cada posición de la
   * línea principal —la primera es la posición de partida—. Quien lo monta
   * decide qué hacer con ellas; este hook no toca el PGN.
   */
  onFinished: (evaluations: MoveEvaluation[]) => void;
}

export interface GameReviewRunner extends GameReviewProgress {
  /** Arranca el recorrido de una partida. */
  start: (pgn: string) => void;
  /** Lo corta y mata el motor. Lo evaluado hasta ahí se descarta. */
  cancel: () => void;
}

export function useGameReview({ onFinished }: Options): GameReviewRunner {
  const [progress, setProgress] = useState<GameReviewProgress>({
    state: "idle",
    done: 0,
    total: 0,
    depth: REVIEW_DEPTH,
  });

  const workerRef = useRef<Worker | null>(null);
  // Por referencia para que arrancar el recorrido no dependa de que quien monta
  // el hook memorice su callback.
  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  const stop = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  // Salir de la pantalla a media evaluación no puede dejar el motor pensando.
  useEffect(() => stop, [stop]);

  const cancel = useCallback(() => {
    stop();
    setProgress({ state: "idle", done: 0, total: 0, depth: REVIEW_DEPTH });
  }, [stop]);

  const start = useCallback(
    (pgn: string) => {
      stop();

      const positions = replayGame(pgn);
      if (positions.length === 0) {
        setProgress({ state: "failed", done: 0, total: 0, depth: REVIEW_DEPTH });
        return;
      }

      let worker: Worker;
      try {
        worker = new Worker("/engine/stockfish.js");
      } catch {
        setProgress({ state: "failed", done: 0, total: 0, depth: REVIEW_DEPTH });
        return;
      }

      workerRef.current = worker;
      setProgress({ state: "running", done: 0, total: positions.length, depth: REVIEW_DEPTH });

      const evaluations: MoveEvaluation[] = [];
      let index = 0;
      /** La mejor lectura de la posición que se está analizando ahora mismo. */
      let current: MoveEvaluation | null = null;

      const askNext = () => {
        if (index >= positions.length) {
          stop();
          setProgress((previous) => ({ ...previous, state: "idle", done: positions.length }));
          onFinishedRef.current(evaluations);
          return;
        }
        current = null;
        worker.postMessage(`position fen ${positions[index].fen}`);
        worker.postMessage(`go depth ${REVIEW_DEPTH}`);
      };

      worker.addEventListener("message", (event: MessageEvent) => {
        const line = typeof event.data === "string" ? event.data : "";

        if (line.startsWith("readyok")) {
          askNext();
          return;
        }

        if (line.startsWith("bestmove")) {
          // Sin puntuación —posición ya terminada, mate o ahogado— se guarda la
          // última conocida: la gráfica necesita un valor por posición.
          evaluations.push(current ?? evaluations[evaluations.length - 1] ?? { score: 0, mateIn: null });
          index += 1;
          setProgress((previous) => ({ ...previous, done: index }));
          askNext();
          return;
        }

        const parsed = parseEngineInfo(line, turnColor(positions[index].fen));
        if (parsed) current = { score: parsed.score, mateIn: parsed.mateIn };
      });

      worker.onerror = () => {
        stop();
        setProgress((previous) => ({ ...previous, state: "failed" }));
      };

      worker.postMessage("uci");
      worker.postMessage("setoption name UCI_AnalyseMode value true");
      // Una sola línea: aquí sólo interesa cuánto vale la posición, y pedir tres
      // multiplicaría el trabajo por posición sin aportar nada a la gráfica.
      worker.postMessage("setoption name MultiPV value 1");
      worker.postMessage("isready");
    },
    [stop],
  );

  return { ...progress, start, cancel };
}
