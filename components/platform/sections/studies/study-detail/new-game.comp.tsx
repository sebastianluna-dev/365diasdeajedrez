"use client";

import { useId, useRef, useState, useTransition } from "react";
import { PGN_MAX_GAMES } from "@/constants/platform/content-limits.const";
import { copyClassGamesToStudy, createStudyGame, importPgnGames } from "@/services/studies/studies.actions";
import type { ClassGameItem, StudyKindOption } from "@/services/studies/studies.types";
import { OptionalFields } from "@/components/platform/shared/optional-fields/optional-fields.comp";
import { PlatformDatePicker } from "@/components/platform/shared/platform-date-picker/platform-date-picker.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import "./new-game.comp.css";

type Tab = "pgn" | "fen" | "blank" | "class";

interface NewGameProps {
  studyId: string;
  studyName: string;
  /** Options of the GameResult catalog; its label IS the PGN token. */
  results: StudyKindOption[];
  /** Games seen in classes attended. Empty = the tab does not appear. */
  classGames: ClassGameItem[];
}

const NOTE = "Podrás editar jugadas y comentarios enseguida.";

export function NewGame({ studyId, studyName, results, classGames }: NewGameProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<Tab>("pgn");
  const [picked, setPicked] = useState<string[]>([]);
  const [, startTransition] = useTransition();
  const titleId = useId();

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
      <button type="button" className="platform-button new-game__open" onClick={() => dialogRef.current?.showModal()}>
        Nueva partida
      </button>

      <dialog
        ref={dialogRef}
        className="platform-dialog new-game__dialog"
        aria-labelledby={titleId}
        onClose={() => setPicked([])}
      >
        <div className="new-game__head">
          <h2 id={titleId} className="new-game__title">
            Nueva partida
          </h2>
          <p className="new-game__subtitle">Se agregará a «{studyName}».</p>
        </div>

        <div className="new-game__tabs" role="tablist" aria-label="Cómo agregar la partida">
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

        {/* The three tabs that write are on the platform's form: a field the
            browser rejects shows its own message, and an optional one says
            «Opcional» by itself. */}
        {tab === "pgn" && (
          <PlatformForm action={importPgnGames.bind(null, studyId)} onSubmit={close} className="new-game__panel">
            <PlatformFormField
              name="pgn"
              label="PGN"
              hint={`Se leen cabeceras, variantes, comentarios y NAGs. Si el PGN trae varias partidas, se crean todas, hasta ${PGN_MAX_GAMES} por importación.`}
              messages={{ valueMissing: "Pega el PGN de la partida." }}
            >
              <textarea required className="new-game__textarea" placeholder={'[Event "…"]\n1. e4 e5 2. Nf3 …'} />
            </PlatformFormField>
            <Footer onCancel={close} label="Agregar partida" />
          </PlatformForm>
        )}

        {/* From a loose position: the "I have this diagram and want to analyse
            it" case. The game is born without moves and in that position, and the
            notation starts counting at the number the FEN says. */}
        {tab === "fen" && (
          <PlatformForm action={createStudyGame.bind(null, studyId)} onSubmit={close} className="new-game__panel">
            <PlatformFormField
              name="initialFen"
              label="FEN"
              hint="La partida arranca en esa posición y sin jugadas previas. Cópialo de Lichess, de un motor o de donde lo tengas."
              messages={{ valueMissing: "Pega el FEN de la posición." }}
            >
              <input
                type="text"
                required
                maxLength={120}
                spellCheck={false}
                placeholder="8/Q3ppk1/1p2r1p1/4b3/P5Pp/1PB1P3/5P1q/2R3K1 w - - 2 44"
              />
            </PlatformFormField>

            <PlatformFormField name="title" label="Nombre de la partida">
              <input type="text" maxLength={120} placeholder="Final de torres, ronda 4…" />
            </PlatformFormField>

            <Footer onCancel={close} label="Agregar partida" />
          </PlatformForm>
        )}

        {/* Every field may be left empty — the moves are played afterwards, in
            the editor —, so that is said once over them and none says
            «Opcional» on its own. */}
        {tab === "blank" && (
          <PlatformForm action={createStudyGame.bind(null, studyId)} onSubmit={close} className="new-game__panel">
            <OptionalFields>
              <div className="new-game__grid">
                <PlatformFormField name="title" label="Nombre de la partida">
                  <input type="text" maxLength={120} placeholder="Ronda 1, Modelo A…" />
                </PlatformFormField>

                <PlatformFormField name="white" label="Blancas">
                  <input type="text" maxLength={120} placeholder="Apellidos, Nombre" />
                </PlatformFormField>
                <PlatformFormField name="whiteElo" label="Elo de las blancas">
                  <input type="number" min={0} max={4000} placeholder="—" />
                </PlatformFormField>

                <PlatformFormField name="black" label="Negras">
                  <input type="text" maxLength={120} placeholder="Apellidos, Nombre" />
                </PlatformFormField>
                <PlatformFormField name="blackElo" label="Elo de las negras">
                  <input type="number" min={0} max={4000} placeholder="—" />
                </PlatformFormField>

                <PlatformFormField name="resultCode" label="Resultado">
                  <PlatformSelect
                    emptyOption="Sin terminar"
                    options={results.map((result) => ({ value: result.code, label: result.label }))}
                  />
                </PlatformFormField>
                <PlatformFormField name="playedAt" label="Fecha">
                  <PlatformDatePicker />
                </PlatformFormField>
              </div>
            </OptionalFields>

            <Footer onCancel={close} label="Agregar partida" />
          </PlatformForm>
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
                          event.target.checked ? [...current, game.id] : current.filter((id) => id !== game.id),
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

            <p className="new-game__hint">Se copian a tu estudio: editarlas aquí no toca la clase original.</p>

            <Footer
              onCancel={close}
              label={picked.length > 1 ? `Agregar ${picked.length} partidas` : "Agregar partida"}
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
  /** Without this the button submits the form wrapping it. */
  onConfirm?: () => void;
}

function Footer({ onCancel, label, disabled, onConfirm }: FooterProps) {
  return (
    <div className="new-game__actions">
      <span className="new-game__note">{NOTE}</span>
      <button type="button" className="platform-button" onClick={onCancel}>
        Cancelar
      </button>
      <button
        type={onConfirm ? "button" : "submit"}
        className="platform-button platform-button_variant_ink"
        disabled={disabled}
        onClick={onConfirm}
      >
        {label}
      </button>
    </div>
  );
}
