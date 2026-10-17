"use client";

import Link from "next/link";
import { useActionState, useId, useState, useTransition } from "react";
import { FileImportIcon } from "@/components/icons/file-import-icon.comp";
import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { PlatformCheckbox } from "@/components/platform/shared/platform-checkbox/platform-checkbox.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import {
  PlatformForm,
  PlatformFormField,
  PlatformFormGroup,
} from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import {
  PlatformTable,
  PlatformTableCell,
  PlatformTableRow,
} from "@/components/platform/shared/platform-table/platform-table.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { EXERCISE_LIMITS } from "@/constants/platform/exercise.const";
import { EXERCISE_KIND, type ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import { MATE_IN_MAX } from "@/lib/chess/exercise-format";
import { EXERCISE_ERROR_MESSAGES, exerciseImportReport } from "@/constants/platform/exercise-messages.const";
import { readExerciseImport } from "@/services/shared/exercise-import";
import {
  EXERCISE_IMPORT_IDLE,
  readExerciseImportForm,
  type ExerciseImportFormState,
} from "@/services/shared/exercise-import-form";
import { popupFormError } from "@/services/shared/form-state";
import { topicCardGroups, type TopicChoice } from "@/services/shared/topic-groups";
import "./exercise-import-form.comp.css";

export interface ExerciseImportFormProps {
  /** Whose bank the file goes to: the teacher's («Listo») or the academy's («En la biblioteca»). */
  audience: "teacher" | "academy";
  kinds: { code: ExerciseKindCode; label: string }[];
  topics: TopicChoice[];
  /** The series the imported ones may join: the author's own. */
  series: { id: string; title: string }[];
  /**
   * The two-step action, through `useActionState`: `importTeacherExercises`
   * or `importStaffExercises`. Without one (`EXERCISES_PERSISTENCE_ENABLED`
   * off), the form reviews the file in the browser with the same reader and
   * «Importar» only says what it would have written: a try of the front.
   */
  action?: (prev: ExerciseImportFormState, formData: FormData) => Promise<ExerciseImportFormState>;
  /** Where «Volver» goes: the bank. */
  backHref: string;
}

const MATE_IN_OPTIONS = Array.from({ length: MATE_IN_MAX }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}));

/** What «ready» is called by whose bank it is. */
const READY_LABELS: Record<ExerciseImportFormProps["audience"], { label: string; description: string }> = {
  teacher: {
    label: "Listo",
    description: "Tus alumnos pueden recibirlo en una serie. Lo que no esté completo entra como borrador.",
  },
  academy: {
    label: "En la biblioteca",
    description:
      "Lo practican todos los alumnos. Lo que no esté completo, o no tenga explicación, entra como borrador.",
  },
};

/**
 * «Importar PGN» (D12; PLAN.md §4.5): the file — pasted, or read from a
 * `.pgn` into the same box —, the defaults for what its headers do not say
 * (difficulty, kind and N, topics), what the accepted ones become, the
 * series they join, and whether the variants marked as mistakes are dropped.
 * Two steps through `useActionState`: «Revisar» answers the report, drawn
 * under the form with one row per game; «Importar N ejercicios» writes what
 * it accepted and leaves for the bank. The form keeps its values in the
 * browser (every control is controlled, so it is submitted by hand), so the
 * report and the file stay on screen while the author decides.
 */
export function ExerciseImportForm({ audience, kinds, topics, series, action, backHref }: ExerciseImportFormProps) {
  // Without persistence the review runs here, in the browser, with the pure
  // reader the server would use; the «import» step writes nothing and answers
  // the counts, so the page says what would have gone in.
  const localAction = async (prev: ExerciseImportFormState, formData: FormData): Promise<ExerciseImportFormState> => {
    void prev;
    const read = readExerciseImportForm(formData);
    if (!read.ok) {
      const code = read.field === "pgn" ? (read.code === "too_big" ? "pgnTooLong" : "pgn") : read.field;
      return popupFormError({ [read.field || "pgn"]: { code } });
    }
    const target = read.values.status === "draft" ? "draft" : audience === "academy" ? "library" : "ready";
    const reading = readExerciseImport(read.values.pgn, { ...read.values.defaults, target }, topics, []);
    const report = exerciseImportReport(reading, target, audience);
    if (read.values.intent === "preview") return { status: "idle", report };
    if (reading.accepted.length === 0) return { ...popupFormError({}, undefined, { code: "importNothing" }), report };
    return {
      status: "done",
      notice: { code: "exercisesImported", args: [reading.counts.ready, reading.counts.draft] },
      report,
    };
  };
  const [state, formAction] = useActionState(action ?? localAction, EXERCISE_IMPORT_IDLE);
  const [pending, startSubmit] = useTransition();
  const [pgn, setPgn] = useState("");
  const [kind, setKind] = useState<ExerciseKindCode>(EXERCISE_KIND.SEQUENCE);
  const [mateIn, setMateIn] = useState("2");
  const [difficulty, setDifficulty] = useState("1200");
  const [chosenTopics, setChosenTopics] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "ready">("ready");
  const [seriesId, setSeriesId] = useState("");
  const [dropMistakes, setDropMistakes] = useState(true);
  // Which step the last submit asked for, so the report says whether it is still what the file would give.
  const [intent, setIntent] = useState<"preview" | "import">("preview");
  const [reviewedPgn, setReviewedPgn] = useState<string | null>(null);
  const fileId = useId();
  const topicCards = topicCardGroups(topics);
  const ready = READY_LABELS[audience];

  const issueOf = (field: string) => {
    const error = state.fieldErrors?.[field];
    return error ? (EXERCISE_ERROR_MESSAGES[error.code] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined;
  };
  const formError = state.formError
    ? (EXERCISE_ERROR_MESSAGES[state.formError.code] ?? EXERCISE_ERROR_MESSAGES.invalid)
    : undefined;
  const report = state.report;
  const accepted = report ? report.counts.ready + report.counts.draft : 0;
  // The report was made of the file as it was reviewed: a change since then asks for another «Revisar».
  const stale = reviewedPgn !== null && reviewedPgn !== pgn;

  const submit = (form: HTMLFormElement, step: "preview" | "import") => {
    const formData = new FormData(form);
    formData.set("intent", step);
    setIntent(step);
    setReviewedPgn(pgn);
    startSubmit(() => formAction(formData));
  };

  const readFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPgn(reader.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="exercise-import">
      <PlatformForm
        className="exercise-import__form"
        onSubmit={(event) => {
          event.preventDefault();
          submit(event.currentTarget, report && !stale ? "import" : "preview");
        }}
      >
        {formError && <PlatformNotice message={formError} />}
        {state.status === "done" && state.notice && (
          <PlatformNotice
            variant="success"
            message={`Prueba sin guardar: se habrían importado ${sumOf(state.notice.args)} ejercicios${draftsOf(state.notice.args)}. Con la persistencia activa entrarían al banco.`}
          />
        )}

        <PlatformFormField
          name="pgn"
          label="PGN"
          hint="Una partida por ejercicio: su [FEN] es la posición, sus jugadas la solución con variantes y comentarios. Las cabeceras [Title], [Prompt], [Difficulty], [Topics], [MateIn], [Hint1]–[Hint3] y [Explanation] rellenan los datos; [White], [Black], [Event] y [Date], el origen."
          serverError={issueOf("pgn")}
        >
          <textarea
            required
            rows={10}
            spellCheck={false}
            placeholder={
              '[Title "El pasillo abierto"]\n[Difficulty "900"]\n[Topics "BACK_RANK_MATE"]\n[MateIn "1"]\n[FEN "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1"]\n\n1. Rd8# *'
            }
            value={pgn}
            onChange={(event) => setPgn(event.currentTarget.value)}
          />
        </PlatformFormField>
        <div className="exercise-import__file">
          <label htmlFor={fileId} className="exercise-import__file-label">
            O carga un archivo .pgn
          </label>
          <input
            id={fileId}
            type="file"
            accept=".pgn,.txt,text/plain,application/x-chess-pgn"
            className="exercise-import__file-input"
            onChange={(event) => readFile(event.currentTarget.files?.[0])}
          />
        </div>

        <fieldset className="exercise-import__defaults">
          <legend className="exercise-import__legend">Para lo que el archivo no diga</legend>

          <PlatformFormGroup label="Tipo" hint="Una partida con [MateIn] es «Mate en N» diga lo que diga esto.">
            <PlatformChoiceCards
              name="kind"
              value={kind}
              onValueChange={(value) => setKind(value as ExerciseKindCode)}
              layout="line"
              options={kinds.map((item) => ({ value: item.code, label: item.label }))}
            />
          </PlatformFormGroup>

          {kind === EXERCISE_KIND.MATE_IN && (
            <PlatformFormField name="mateIn" label="Mate en" serverError={issueOf("mateIn")}>
              <PlatformSelect required options={MATE_IN_OPTIONS} value={mateIn} onValueChange={setMateIn} />
            </PlatformFormField>
          )}

          <PlatformFormField
            name="difficulty"
            label="Dificultad"
            hint={`Entre ${EXERCISE_LIMITS.difficultyMin} y ${EXERCISE_LIMITS.difficultyMax}, de ${EXERCISE_LIMITS.difficultyStep} en ${EXERCISE_LIMITS.difficultyStep}.`}
            serverError={issueOf("difficulty")}
          >
            <input
              type="number"
              required
              min={EXERCISE_LIMITS.difficultyMin}
              max={EXERCISE_LIMITS.difficultyMax}
              step={EXERCISE_LIMITS.difficultyStep}
              value={difficulty}
              onChange={(event) => setDifficulty(event.currentTarget.value)}
            />
          </PlatformFormField>

          <PlatformFormGroup
            label="Temas"
            optional
            hint="Para las partidas sin [Topics]. Sin tema, un ejercicio entra como borrador."
            serverError={issueOf("topics")}
          >
            <PlatformCheckCards
              name="topics"
              layout="line"
              value={chosenTopics}
              onValueChange={setChosenTopics}
              {...topicCards}
            />
          </PlatformFormGroup>
        </fieldset>

        <PlatformFormGroup label="Estado al importar">
          <PlatformChoiceCards
            name="status"
            value={status}
            onValueChange={(value) => setStatus(value as "draft" | "ready")}
            options={[
              { value: "draft", label: "Borrador", description: "Nadie lo ve hasta que lo revises en el editor." },
              { value: "ready", label: ready.label, description: ready.description },
            ]}
          />
        </PlatformFormGroup>

        {series.length > 0 && (
          <PlatformFormField name="seriesId" label="Agregar a la serie" serverError={issueOf("seriesId")}>
            <PlatformSelect
              emptyOption="Ninguna"
              options={series.map((item) => ({ value: item.id, label: item.title }))}
              value={seriesId}
              onValueChange={setSeriesId}
            />
          </PlatformFormField>
        )}

        <PlatformCheckbox
          name="dropMistakeVariants"
          label="Eliminar las variantes marcadas como error"
          hint="Una variante con ?, ?? o ?! se aceptaría como solución: se quita antes de leer cada partida."
          checked={dropMistakes}
          onCheckedChange={setDropMistakes}
        />

        <div className="exercise-import__actions">
          <SubmitButton
            className="platform-button"
            pendingLabel="Revisando…"
            pending={pending && intent === "preview"}
            onClick={(event) => {
              event.preventDefault();
              const form = event.currentTarget.form;
              if (form?.reportValidity()) submit(form, "preview");
            }}
          >
            <MagnifyingGlassIcon variant="classic-solid" className="platform-button__icon" />
            Revisar
          </SubmitButton>
          {report && accepted > 0 && !stale && (
            <SubmitButton
              className="platform-button platform-button_variant_accent"
              pendingLabel="Importando…"
              pending={pending && intent === "import"}
              onClick={(event) => {
                event.preventDefault();
                const form = event.currentTarget.form;
                if (form?.reportValidity()) submit(form, "import");
              }}
            >
              <FileImportIcon variant="classic-solid" className="platform-button__icon" />
              {accepted === 1 ? "Importar 1 ejercicio" : `Importar ${accepted} ejercicios`}
            </SubmitButton>
          )}
          <Link href={backHref} className="platform-button">
            Volver
          </Link>
        </div>
      </PlatformForm>

      {report && (
        <section className="exercise-import__report" aria-labelledby="exercise-import-report">
          <h2 id="exercise-import-report" className="exercise-import__heading">
            Revisión del archivo
          </h2>
          <p className="exercise-import__summary">
            {summaryOf(report.counts)}
            {stale && " El PGN cambió desde la revisión: vuelve a pulsar «Revisar»."}
          </p>
          <PlatformTable
            columns={["#", "Ejercicio", "Qué pasará", "Notas"]}
            label="Revisión de la importación"
            minWidth={560}
          >
            {report.rows.map((row) => (
              <PlatformTableRow key={row.index}>
                <PlatformTableCell>{row.index}</PlatformTableCell>
                <PlatformTableCell strong>{row.title}</PlatformTableCell>
                <PlatformTableCell>
                  <span className={`exercise-import__outcome exercise-import__outcome_kind_${row.outcome}`}>
                    {row.status}
                  </span>
                </PlatformTableCell>
                <PlatformTableCell>{row.notes.length === 0 ? "" : row.notes.join(" ")}</PlatformTableCell>
              </PlatformTableRow>
            ))}
          </PlatformTable>
        </section>
      )}
    </div>
  );
}

/** «12 se importarán, 2 como borrador; 3 se quedan fuera.» */
function summaryOf(counts: { ready: number; draft: number; skipped: number }): string {
  const parts: string[] = [];
  const going = counts.ready + counts.draft;
  if (going === 0) parts.push("Ninguna partida se importará");
  else parts.push(`${going === 1 ? "1 ejercicio se importará" : `${going} ejercicios se importarán`}`);
  if (counts.draft > 0) parts.push(`${counts.draft} como borrador`);
  const head = parts.join(", ");
  if (counts.skipped === 0) return `${head}.`;
  return `${head}; ${counts.skipped === 1 ? "1 se queda fuera" : `${counts.skipped} se quedan fuera`}.`;
}

/** The notice's two counts, added: what would have gone in. */
function sumOf(args: (number | string)[] | undefined): number {
  return (args ?? []).reduce<number>((total, arg) => total + Number(arg), 0);
}

/** « (3 como borrador)», or nothing. */
function draftsOf(args: (number | string)[] | undefined): string {
  const drafts = Number(args?.[1] ?? 0);
  return drafts > 0 ? ` (${drafts} como borrador)` : "";
}
