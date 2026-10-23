"use client";

import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { useRef, useState, useTransition } from "react";
import { PGN_MAX_GAMES } from "@/constants/platform/content-limits.const";
import { mdFab } from "@/lib/material/material-classes";
import { copyClassGamesToStudy, createStudyGame, importPgnGames } from "@/services/studies/studies.actions";
import type { ClassGameItem, StudyKindOption } from "@/services/studies/studies.types";
import { OptionalFields } from "@/components/platform/shared/optional-fields/optional-fields.comp";
import { PlatformDatePicker } from "@/components/platform/shared/platform-date-picker/platform-date-picker.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { popupButton, usePlatformLook } from "@/components/platform/shared/platform-look";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { PlatformCheckbox } from "@/components/platform/shared/platform-checkbox/platform-checkbox.comp";
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
  const popup = useRef<PlatformPopupHandle>(null);
  const [tab, setTab] = useState<Tab>("pgn");
  const [picked, setPicked] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  const close = () => popup.current?.close();

  /** Whichever exit: the next opening starts on the first tab with nothing ticked. */
  const reset = () => {
    setTab("pgn");
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
      {/* The study's main action, at the top of its side column as Material's
          extended FAB (the new design system, 2026-10-23). */}
      <button
        type="button"
        className={`${mdFab("primary-container")} new-game__open`}
        onClick={(event) => popup.current?.open(event)}
      >
        <PlusIcon variant="classic-solid" className="platform-md-icon" />
        Nuevo capítulo
      </button>

      <PlatformPopup ref={popup} title="Nuevo capítulo" size="md" onClose={reset}>
        <p className="new-game__subtitle">Se agregará a «{studyName}».</p>

        <div className="new-game__tabs" role="tablist" aria-label="Cómo agregar el capítulo">
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
            <Footer onCancel={close} label="Agregar capítulo" />
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

            <PlatformFormField name="title" label="Nombre del capítulo">
              <input type="text" maxLength={120} placeholder="Final de torres, ronda 4…" />
            </PlatformFormField>

            <Footer onCancel={close} label="Agregar capítulo" />
          </PlatformForm>
        )}

        {/* Every field may be left empty — the moves are played afterwards, in
            the editor —, so that is said once over them and none says
            «Opcional» on its own. */}
        {tab === "blank" && (
          <PlatformForm action={createStudyGame.bind(null, studyId)} onSubmit={close} className="new-game__panel">
            <OptionalFields>
              <div className="new-game__grid">
                <PlatformFormField name="title" label="Nombre del capítulo">
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

            <Footer onCancel={close} label="Agregar capítulo" />
          </PlatformForm>
        )}

        {tab === "class" && (
          <div className="new-game__panel">
            <ul className="new-game__list">
              {classGames.map((game) => (
                <li key={game.id}>
                  <PlatformCheckbox
                    checked={picked.includes(game.id)}
                    onCheckedChange={(checked) =>
                      setPicked((current) => (checked ? [...current, game.id] : current.filter((id) => id !== game.id)))
                    }
                    label={`${game.white} – ${game.black}`}
                    hint={`Clase del ${game.classDateLabel} · ${game.className}`}
                    className="new-game__pick"
                  />
                </li>
              ))}
            </ul>

            <p className="new-game__hint">Se copian a tu estudio: editarlas aquí no toca la clase original.</p>

            <Footer
              onCancel={close}
              label={picked.length > 1 ? `Agregar ${picked.length} capítulos` : "Agregar capítulo"}
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
      </PlatformPopup>
    </div>
  );
}

interface FooterProps {
  onCancel: () => void;
  label: string;
  disabled?: boolean;
  /** Without this the button submits the form wrapping it, and says it is on its way. */
  onConfirm?: () => void;
}

function Footer({ onCancel, label, disabled, onConfirm }: FooterProps) {
  // The popup's look: Material's buttons on a page moved to the new design system.
  const look = usePlatformLook();
  return (
    <div className="new-game__actions">
      <span className="new-game__note">{NOTE}</span>
      <button type="button" className={popupButton(look, "exit")} onClick={onCancel}>
        Cancelar
      </button>
      {onConfirm ? (
        <button type="button" className={popupButton(look, "submit")} disabled={disabled} onClick={onConfirm}>
          {label}
        </button>
      ) : (
        <SubmitButton className={popupButton(look, "submit")} disabled={disabled} pendingLabel="Agregando…">
          {label}
        </SubmitButton>
      )}
    </div>
  );
}
