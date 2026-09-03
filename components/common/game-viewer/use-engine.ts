"use client";

import { useEffect, useRef, useState } from "react";
import {
  mergeEngineLines,
  orderedEngineLines,
  parseEngineInfo,
  type EngineInfo,
  type EngineLines,
} from "@/lib/chess/engine-protocol";
import { turnColor } from "@/lib/chess/replay";

// El módulo de análisis, atado al ciclo de vida de un componente.
//
// Stockfish corre en su propio Web Worker: es un programa aparte, no código de
// la plataforma, y así el análisis no bloquea la interfaz por hondo que baje. El
// worker se crea PEREZOSAMENTE, sólo al encenderlo, porque son 7 MB de
// WebAssembly que no tiene sentido descargar a quien nunca lo va a usar.
//
// LO IMPORTANTE DE ESTE ARCHIVO: el protocolo UCI es una conversación por
// turnos, no un buzón. `stop` no detiene la búsqueda al momento —pide que
// termine— y hasta que el motor no contesta `bestmove` sigue analizando.
// Mandarle `position` en ese hueco es una violación del protocolo, y Stockfish
// no la perdona: aborta con «RuntimeError: unreachable» y se lleva el worker por
// delante. Por eso aquí hay una pequeña máquina de estados en vez de escribir
// los comandos a bocajarro.

/** Hasta dónde analiza: de fiar sin dejar el portátil de nadie a pleno rendimiento. */
const MAX_DEPTH = 20;

/**
 * Cuántas continuaciones se le piden.
 *
 * Tres es lo que hace legible una posición: con una sola no se ve si la jugada
 * buena lo es por poco o por mucho. Cuesta trabajo al motor —analiza las tres
 * en serio, no reaprovecha—, por eso no son cinco.
 */
const ENGINE_LINES = 3;

export interface EngineState {
  /** Las continuaciones de la posición ACTUAL, la mejor primero. */
  lines: EngineInfo[];
  /** La mejor de todas: es la que manda en la barra de evaluación. */
  info: EngineInfo | null;
  loading: boolean;
  /** No se pudo cargar: se avisa en vez de dejar un botón que no responde. */
  failed: boolean;
}

/** Lo que hay que recordar entre mensajes para no romper el turno de palabra. */
interface Conversation {
  /** El motor ya contestó `readyok`: antes de eso no se le pide nada. */
  ready: boolean;
  /** Hay un `go` en vuelo; hasta su `bestmove` no se puede cambiar de posición. */
  searching: boolean;
  /** La posición que habría que estar analizando. */
  wanted: string;
  /** La que se le pidió de verdad, que puede ir por detrás de `wanted`. */
  searching_fen: string;
  /** La última que terminó, para no volver a lanzarla en bucle. */
  finished: string;
}

export function useEngine(fen: string, enabled: boolean): EngineState {
  // Las evaluaciones se guardan JUNTO A LA POSICIÓN que las produjo. Así no hay
  // que limpiarlas al cambiar de jugada —cosa que obligaría a tocar el estado
  // dentro de un efecto— y además es imposible enseñar la evaluación de otra
  // posición: si no coincide el FEN, no se usa.
  const [result, setResult] = useState<EngineLines | null>(null);
  const [failed, setFailed] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  /** El lanzador lo publica el efecto de arranque para que el de posición lo use. */
  const startRef = useRef<(() => void) | null>(null);
  const talkRef = useRef<Conversation>({
    ready: false,
    searching: false,
    wanted: "",
    searching_fen: "",
    finished: "",
  });

  // Arranque y parada. Depende sólo de `enabled`: apagarlo tiene que MATAR el
  // worker, no dejarlo pensando en segundo plano.
  useEffect(() => {
    if (!enabled) return;

    // En desarrollo, el modo estricto monta el efecto, lo limpia y lo vuelve a
    // montar. Esa limpieza termina el PRIMER worker mientras todavía está
    // descargando sus 7 MB, y abortar esa carga dispara su `onerror`. Sin esta
    // marca, ese error de un worker ya muerto daba por fallido el módulo aunque
    // el segundo arrancara perfectamente.
    let cancelled = false;

    let worker: Worker;
    try {
      worker = new Worker("/engine/stockfish.js");
    } catch {
      // El constructor puede lanzar de forma síncrona —un navegador sin Workers
      // o un entorno que los bloquea—. La marca se aplaza un tic: cambiar el
      // estado en el cuerpo del efecto sería un render dentro de otro.
      const pending = window.setTimeout(() => {
        if (!cancelled) setFailed(true);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(pending);
      };
    }

    workerRef.current = worker;
    const talk = talkRef.current;
    talk.ready = false;
    talk.searching = false;
    talk.searching_fen = "";
    talk.finished = "";

    /** Lanza la búsqueda pendiente, si es que ahora se puede. */
    const startIfPossible = () => {
      if (!talk.ready || talk.searching) return;
      if (!talk.wanted || talk.wanted === talk.finished) return;

      talk.searching = true;
      talk.searching_fen = talk.wanted;
      worker.postMessage(`position fen ${talk.wanted}`);
      worker.postMessage(`go depth ${MAX_DEPTH}`);
    };
    startRef.current = startIfPossible;

    const onMessage = (event: MessageEvent) => {
      const line = typeof event.data === "string" ? event.data : "";
      if (cancelled) return;

      if (line.startsWith("readyok")) {
        talk.ready = true;
        startIfPossible();
        return;
      }

      if (line.startsWith("bestmove")) {
        // Aquí es donde de verdad se libera el turno: hasta este mensaje el
        // motor seguía analizando por mucho `stop` que se le hubiera mandado.
        talk.searching = false;
        talk.finished = talk.searching_fen;
        startIfPossible();
        return;
      }

      const searched = talk.searching_fen;
      if (!searched) return;
      const parsed = parseEngineInfo(line, turnColor(searched));
      if (parsed && parsed.pv.length > 0) {
        setResult((current) => mergeEngineLines(current, searched, parsed));
      }
    };

    worker.addEventListener("message", onMessage);
    worker.onerror = () => {
      if (!cancelled) setFailed(true);
    };

    worker.postMessage("uci");
    worker.postMessage("setoption name UCI_AnalyseMode value true");
    // Se fija una vez, al arrancar: es una opción del motor, no de la posición.
    worker.postMessage(`setoption name MultiPV value ${ENGINE_LINES}`);
    // Nada se le pide hasta que conteste: el `readyok` es lo que abre la puerta.
    worker.postMessage("isready");

    return () => {
      cancelled = true;
      worker.removeEventListener("message", onMessage);
      // `terminate()` a secas: mandarle «stop» antes no aporta nada —se muere
      // igual— y es un mensaje más que puede fallar si aún no ha arrancado.
      worker.terminate();
      workerRef.current = null;
      startRef.current = null;
    };
  }, [enabled]);

  // Cambiar de jugada NO reinicia el worker: sólo cambia qué posición se quiere.
  // Si hay una búsqueda en marcha se pide que pare y se espera su `bestmove`;
  // la nueva sale de ahí. Mandarla ahora mismo es lo que hacía abortar al motor.
  useEffect(() => {
    const worker = workerRef.current;
    if (!enabled || !fen || !worker) return;

    const talk = talkRef.current;
    talk.wanted = fen;

    if (talk.searching && talk.searching_fen !== fen) {
      // Sólo se PIDE que pare. La nueva posición la lanza el `bestmove` cuando
      // llegue, que es cuando el motor de verdad ha soltado el turno.
      worker.postMessage("stop");
    } else {
      startIfReady(startRef);
    }
  }, [fen, enabled]);

  const lines = orderedEngineLines(result, fen);
  return { lines, info: lines[0] ?? null, loading: enabled && !failed && lines.length === 0, failed };
}

/** Llama al lanzador si el efecto de arranque ya lo publicó. */
function startIfReady(ref: { current: (() => void) | null }): void {
  ref.current?.();
}
