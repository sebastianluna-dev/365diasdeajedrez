"use client";

import { type ReactNode, useCallback, useEffect, useReducer, useState } from "react";
import { GameViewer } from "@/components/common/game-viewer/game-viewer.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { federationFlag } from "@/lib/chess/federations";
import { autosaveGamePgn } from "@/services/studies/studies.actions";
import type { GameView, StudyGameItem } from "@/services/studies/studies.types";
import { GameAside } from "./game-aside.comp";
import { GameTools, type GameToolsTab } from "./game-tools.comp";
import "./game-view.section.css";

interface GameViewSectionProps {
  game: GameView;
  /** Todas las del estudio, la actual incluida: alimentan el aside. */
  siblings: StudyGameItem[];
  /** Modal de nueva partida; ausente en las bases de curso. */
  newGame?: ReactNode;
  /** Modal de datos de la partida; ausente en las bases de curso. */
  editGame?: ReactNode;
  /** Lo que rebotó de una acción del servidor (borrar sin confirmar). */
  errorCode?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  gameInClasses:
    "Esta partida está usada en el contenido de alguna clase. Si la borras, esos bloques se quedarán vacíos. Marca la casilla para confirmarlo.",
};

/** Espera tras el último cambio antes de guardar. */
const AUTOSAVE_DELAY_MS = 1200;

/**
 * Cuántos pasos atrás se recuerdan. Se guarda el PGN entero de cada uno —una
 * partida ocupa unos pocos kilobytes—, que es infinitamente más simple que
 * llevar un registro de operaciones inversas y no puede desincronizarse.
 */
const HISTORY_LIMIT = 50;

type SaveState = "idle" | "saving" | "saved" | "error";

interface PgnHistory {
  pgn: string;
  /** Los estados anteriores, del más viejo al más reciente. */
  past: string[];
}

type PgnAction = { type: "edit"; pgn: string } | { type: "undo" };

/**
 * El PGN y por dónde ha pasado, en un reducer y no en dos estados sueltos:
 * deshacer tiene que mover los dos a la vez, y con `useState` habría un momento
 * en que el historial y el PGN no se corresponden.
 */
function pgnReducer(state: PgnHistory, action: PgnAction): PgnHistory {
  if (action.type === "undo") {
    const previous = state.past.at(-1);
    return previous === undefined ? state : { pgn: previous, past: state.past.slice(0, -1) };
  }

  // Guardar dos veces el mismo PGN gastaría un paso de deshacer que no deshace
  // nada, y eso se nota: el primer Ctrl+Z parecería no funcionar.
  if (action.pgn === state.pgn) return state;
  return { pgn: action.pgn, past: [...state.past, state.pgn].slice(-HISTORY_LIMIT) };
}

interface PlayerProps {
  name: string;
  elo?: number;
  title?: string;
  country?: string;
  side: "white" | "black";
}

function Player({ name, elo, title, country, side }: PlayerProps) {
  const flag = federationFlag(country);

  return (
    <>
      <span className={`game-view__chip game-view__chip_side_${side}`} aria-hidden="true" />

      {country && <span className="game-view__player-country">{country}</span>}
      {/* La bandera es adorno del código que va al lado: si el código no está
          en la tabla no se pinta nada, en vez de inventarse una. */}
      {flag && (
        <span className="game-view__player-flag" aria-hidden="true">
          {flag}
        </span>
      )}
      {title && <span className="game-view__player-title">{title}</span>}

      <span className="game-view__player-name">{name}</span>
      {elo !== undefined && <span className="game-view__player-elo">{elo}</span>}
    </>
  );
}

/**
 * La pantalla de una partida de Mis estudios: se lee y se anota en el MISMO
 * sitio.
 *
 * No hay pantalla de edición aparte. Quien es dueño de la partida juega sobre
 * el tablero para añadir jugadas y usa el clic derecho de la lista para
 * comentarlas, anotarlas, promoverlas o borrarlas; todo eso se guarda solo.
 */
export function GameViewSection({ game, siblings, newGame, editGame, errorCode }: GameViewSectionProps) {
  // El PGN vive aquí porque lo comparten el visor —que lo lee y lo edita— y el
  // panel de herramientas —que también lo escribe—. Si cada uno guardara el
  // suyo, comentar una jugada no se vería en la lista hasta recargar.
  const [history, dispatch] = useReducer(pgnReducer, { pgn: game.pgn, past: [] });
  const pgn = history.pgn;
  const applyPgn = useCallback((next: string) => dispatch({ type: "edit", pgn: next }), []);
  const [currentPath, setCurrentPath] = useState("");

  // Ctrl+Z (⌘Z en Mac) deshace el último cambio sobre la partida. Mientras se
  // escribe un comentario manda el deshacer del propio campo, que es lo que
  // cualquiera espera con el cursor dentro de un texto.
  useEffect(() => {
    if (!game.canEdit) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "z" || event.shiftKey) return;
      if (!event.metaKey && !event.ctrlKey) return;

      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.isContentEditable)) {
        return;
      }

      event.preventDefault();
      dispatch({ type: "undo" });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game.canEdit]);

  // Qué pestaña de las herramientas está abierta y cuándo llevar el foco hasta
  // ella: «Comentar este movimiento» del menú de la jugada no abre nada propio,
  // baja a este panel, que es donde se escribe siempre. El contador es lo que
  // distingue dos peticiones seguidas sobre la MISMA pestaña, que en un
  // booleano serían indistinguibles.
  const [toolsTab, setToolsTab] = useState<GameToolsTab>(game.canEdit ? "comment" : "share");
  const [focusRequest, setFocusRequest] = useState(0);

  // Lo último que el servidor confirmó. «Hay cambios sin guardar» se DEDUCE de
  // compararlo con el PGN actual, en vez de ser un estado más que mantener.
  const [lastSaved, setLastSaved] = useState(game.pgn);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Se espera a que pare de trabajar y se guarda lo ÚLTIMO: si durante la
  // espera cambia algo más, el temporizador se reinicia y la versión intermedia
  // no llega a enviarse.
  useEffect(() => {
    if (!game.canEdit || pgn === lastSaved) return;

    const timer = setTimeout(async () => {
      setSaveState("saving");
      try {
        const result = await autosaveGamePgn(game.studyId, game.id, pgn);
        if (result.ok) {
          setLastSaved(pgn);
          setSaveState("saved");
        } else {
          setSaveState("error");
        }
      } catch {
        setSaveState("error");
      }
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pgn, lastSaved, game.canEdit, game.studyId, game.id]);

  // Avisa si se cierra la pestaña con algo aún sin guardar. No se puede esperar
  // a una petición aquí, así que lo único honesto es preguntar.
  useEffect(() => {
    if (!game.canEdit) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (pgn !== lastSaved) event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [game.canEdit, pgn, lastSaved]);

  // El error manda sobre todo lo demás: si la última escritura falló hay que
  // decirlo aunque después se haya vuelto a escribir.
  const saveLabel =
    !game.canEdit || (saveState === "idle" && pgn === lastSaved)
      ? undefined
      : saveState === "error"
        ? "no se pudo guardar"
        : saveState === "saving"
          ? "guardando…"
          : pgn !== lastSaved
            ? "sin guardar"
            : "guardado";

  return (
    <section className="game-view">
      <GameAside game={game} siblings={siblings} newGame={newGame} editGame={editGame} />

      <div className="game-view__board">
        {errorCode && <PlatformNotice message={ERROR_MESSAGES[errorCode] ?? "No se pudo completar la acción."} />}

        <GameViewer
          pgn={pgn}
          // Sin cabecera en el panel: los jugadores ya están en las tiras del
          // tablero y en la ficha del aside, y repetirlos aquí robaba alto a
          // las jugadas, que es lo que se viene a mirar.
          // En Mis estudios la partida se recorre: los controles van junto a
          // las jugadas, no bajo el tablero.
          controls="panel"
          engine
          editable={game.canEdit}
          onPgnChange={applyPgn}
          onPathChange={setCurrentPath}
          onRequestEdit={(mode) => {
            setToolsTab(mode === "comment" ? "comment" : "quality");
            setFocusRequest((count) => count + 1);
          }}
          players={{
            white: (
              <Player
                name={game.white}
                elo={game.whiteElo}
                title={game.whiteTitle}
                country={game.whiteCountry}
                side="white"
              />
            ),
            black: (
              <Player
                name={game.black}
                elo={game.blackElo}
                title={game.blackTitle}
                country={game.blackCountry}
                side="black"
              />
            ),
          }}
          boardFooter={
            <GameTools
              pgn={pgn}
              currentPath={currentPath}
              canEdit={game.canEdit}
              saveLabel={saveLabel}
              tab={toolsTab}
              onTabChange={setToolsTab}
              focusRequest={focusRequest}
              onPgnChange={applyPgn}
            />
          }
        />
      </div>
    </section>
  );
}
