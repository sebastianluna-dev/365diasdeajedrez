"use client";

import { useRef, useState, useTransition } from "react";
import { copyClassGamesToStudy, createStudyGame, importPgnGames } from "@/services/studies/studies.actions";
import type { ClassGameItem, StudyKindOption } from "@/services/studies/studies.types";
import "./new-game.comp.css";

type Tab = "pgn" | "fen" | "blank" | "class";

interface NewGameProps {
  studyId: string;
  studyName: string;
  /** Opciones del catálogo GameResult; su label ES el token PGN. */
  results: StudyKindOption[];
  /** Partidas vistas en clases a las que asistió. Vacío = la pestaña no sale. */
  classGames: ClassGameItem[];
}

const NOTE = "Podrás editar jugadas y comentarios enseguida.";

export function NewGame({ studyId, studyName, results, classGames }: NewGameProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<Tab>("pgn");
  const [picked, setPicked] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  const close = () => {
    dialogRef.current?.close();
    setPicked([]);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "pgn", label: "Pegar PGN" },
    { key: "fen", label: "Desde un FEN" },
    { key: "blank", label: "Crear vacía" },
    ...(classGames.length > 0 ? ([{ key: "class", label: "Desde una clase" }] as const) : []),
  ];

  return (
    <div className="new-game">
      <button
        type="button"
        className="platform-button new-game__open"
        onClick={() => dialogRef.current?.showModal()}
      >
        Nueva partida
      </button>

      <dialog ref={dialogRef} className="platform-dialog new-game__dialog" onClose={() => setPicked([])}>
        <div className="new-game__head">
          <h2 className="new-game__title">Nueva partida</h2>
          <p className="new-game__subtitle">Se añadirá a «{studyName}».</p>
        </div>

        <div className="new-game__tabs" role="tablist" aria-label="Cómo añadir la partida">
          {tabs.map((option) => (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={tab === option.key}
              onClick={() => setTab(option.key)}
              className={`new-game__tab${tab === option.key ? " new-game__tab_state_active" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {tab === "pgn" && (
          <form action={importPgnGames.bind(null, studyId)} onSubmit={close} className="new-game__panel">
            <textarea
              name="pgn"
              required
              className="new-game__textarea"
              placeholder={'[Event "…"]\n1. e4 e5 2. Nf3 …'}
            />
            <p className="new-game__hint">
              Se leen cabeceras, variantes, comentarios y NAGs. Si el PGN trae varias partidas, se crean todas.
            </p>
            <Footer onCancel={close} label="Añadir partida" />
          </form>
        )}

        {/* Desde una posición suelta: el caso de «tengo este diagrama y quiero
            analizarlo». La partida nace sin jugadas y en esa posición, y la
            notación empieza a contar en el número que diga el FEN. */}
        {tab === "fen" && (
          <form action={createStudyGame.bind(null, studyId)} onSubmit={close} className="new-game__panel">
            {/* Para que un FEN mal escrito avise AQUÍ y no en otra pantalla. */}
            <input type="hidden" name="origin" value="detail" />

            <label className="new-game__field">
              <span className="new-game__label">FEN</span>
              <input
                className="new-game__input"
                type="text"
                name="initialFen"
                required
                maxLength={120}
                spellCheck={false}
                placeholder="8/Q3ppk1/1p2r1p1/4b3/P5Pp/1PB1P3/5P1q/2R3K1 w - - 2 44"
              />
            </label>

            <label className="new-game__field">
              <span className="new-game__label">Nombre de la partida</span>
              <input
                className="new-game__input"
                type="text"
                name="title"
                maxLength={120}
                placeholder="Final de torres, ronda 4…"
              />
            </label>

            <p className="new-game__hint">
              La partida arranca en esa posición y sin jugadas previas. Cópialo de Lichess, de un motor o de
              donde lo tengas.
            </p>
            <Footer onCancel={close} label="Añadir partida" />
          </form>
        )}

        {tab === "blank" && (
          <form action={createStudyGame.bind(null, studyId)} onSubmit={close} className="new-game__panel">
            <div className="new-game__grid">
              <label className="new-game__field new-game__field_span_all">
                <span className="new-game__label">Nombre de la partida</span>
                <input className="new-game__input" type="text" name="title" maxLength={120} placeholder="Ronda 1, Modelo A…" />
              </label>

              <label className="new-game__field">
                <span className="new-game__label">Blancas</span>
                <input className="new-game__input" type="text" name="white" maxLength={120} placeholder="Apellidos, Nombre" />
              </label>
              <label className="new-game__field">
                <span className="new-game__label">Elo de las blancas</span>
                <input className="new-game__input" type="number" name="whiteElo" min={0} max={4000} placeholder="—" />
              </label>

              <label className="new-game__field">
                <span className="new-game__label">Negras</span>
                <input className="new-game__input" type="text" name="black" maxLength={120} placeholder="Apellidos, Nombre" />
              </label>
              <label className="new-game__field">
                <span className="new-game__label">Elo de las negras</span>
                <input className="new-game__input" type="number" name="blackElo" min={0} max={4000} placeholder="—" />
              </label>

              <label className="new-game__field">
                <span className="new-game__label">Resultado</span>
                <select className="new-game__input" name="resultCode" defaultValue="">
                  <option value="">Sin terminar</option>
                  {results.map((result) => (
                    <option key={result.code} value={result.code}>
                      {result.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="new-game__field">
                <span className="new-game__label">Fecha</span>
                <input className="new-game__input" type="date" name="playedAt" />
              </label>
            </div>

            <p className="new-game__hint">
              Puedes dejarlo casi vacío y jugar las jugadas después en el editor.
            </p>
            <Footer onCancel={close} label="Añadir partida" />
          </form>
        )}

        {tab === "class" && (
          <div className="new-game__panel">
            <ul className="new-game__list">
              {classGames.map((game) => (
                <li key={game.id}>
                  <label className="new-game__pick">
                    <input
                      type="checkbox"
                      className="new-game__checkbox"
                      checked={picked.includes(game.id)}
                      onChange={(event) =>
                        setPicked((current) =>
                          event.target.checked
                            ? [...current, game.id]
                            : current.filter((id) => id !== game.id),
                        )
                      }
                    />
                    <span className="new-game__pick-text">
                      <span className="new-game__pick-name">
                        {game.white} – {game.black}
                      </span>
                      <span className="new-game__pick-meta">
                        Clase del {game.classDateLabel} · {game.className}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            <p className="new-game__hint">
              Se copian a tu estudio: editarlas aquí no toca la clase original.
            </p>

            <Footer
              onCancel={close}
              label={picked.length > 1 ? `Añadir ${picked.length} partidas` : "Añadir partida"}
              disabled={picked.length === 0}
              onConfirm={() => {
                const ids = picked;
                close();
                startTransition(() => {
                  void copyClassGamesToStudy(studyId, ids);
                });
              }}
            />
          </div>
        )}
      </dialog>
    </div>
  );
}

interface FooterProps {
  onCancel: () => void;
  label: string;
  disabled?: boolean;
  /** Sin esto el botón envía el formulario que lo envuelve. */
  onConfirm?: () => void;
}

function Footer({ onCancel, label, disabled, onConfirm }: FooterProps) {
  return (
    <div className="new-game__actions">
      <span className="new-game__note">{NOTE}</span>
      <button type="button" className="platform-button platform-button_variant_secondary" onClick={onCancel}>
        Cancelar
      </button>
      <button
        type={onConfirm ? "button" : "submit"}
        className="platform-button"
        disabled={disabled}
        onClick={onConfirm}
      >
        {label}
      </button>
    </div>
  );
}
