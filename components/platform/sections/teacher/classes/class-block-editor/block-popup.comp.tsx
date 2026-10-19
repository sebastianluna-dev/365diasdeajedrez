"use client";

import { useActionState, useEffect, useImperativeHandle, useRef, useState, useTransition, type Ref } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import { PlatformForm, PlatformFormGroup } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import {
  CLASS_BLOCK_KIND,
  CLASS_BLOCK_VISIBILITY,
  type ClassBlockKindCode,
  type ClassBlockVisibilityCode,
} from "@/constants/platform/class-codes.const";
import { CLASS_FIELD_ERRORS } from "@/constants/platform/class-messages.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import type { TeacherClassBlock } from "@/services/teacher-classes/teacher-classes.types";
import { BlockForm, type BlockFormOptions } from "./block-form.comp";
import { DiagramEditor } from "./diagram-editor.comp";
import type { FetchReferencePgn } from "@/services/teacher-classes/teacher-classes.types";
import "./block-popup.comp.css";

/** What the host opens the popup with: a new block of a kind in a section, or a block to edit. */
export interface BlockPopupPreset {
  kind?: ClassBlockKindCode;
  visibility: ClassBlockVisibilityCode;
  block?: TeacherClassBlock;
  /** A game chosen elsewhere («Usar en una clase»). */
  gameId?: string;
}

export interface BlockPopupHandle {
  open: (event: { currentTarget: HTMLElement } | undefined, preset: BlockPopupPreset) => void;
  close: () => void;
}

export interface BlockPopupProps {
  classId: string;
  options: BlockFormOptions;
  /** How many students the class has: a student's game is seen by all of them. */
  groupSize: number;
  /** What ends the class: for «Lo verá cuando termine la clase, a las 13:00.» */
  endHour: string;
  /** Who the student is, as it reads mid-sentence: «tus alumnos», «Alumno Demo»; capitalised when it opens one. */
  studentLabel: string;
  /** «tus alumnos» takes «ven»; one student, «ve». */
  studentPlural?: boolean;
  addClassBlock: (classId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  updateClassBlock: (
    classId: string,
    blockId: string,
    prev: PopupFormState,
    formData: FormData,
  ) => Promise<PopupFormState>;
  fetchReferencePgn: FetchReferencePgn;
  ref?: Ref<BlockPopupHandle>;
}

export const KIND_LABELS: Record<ClassBlockKindCode, string> = {
  [CLASS_BLOCK_KIND.TEXT]: "Texto",
  [CLASS_BLOCK_KIND.VIDEO]: "Video",
  [CLASS_BLOCK_KIND.GAME_REF]: "Partida",
  [CLASS_BLOCK_KIND.LESSON_REF]: "Lección",
  [CLASS_BLOCK_KIND.POSITION_REF]: "Posición",
  [CLASS_BLOCK_KIND.FILE]: "Archivo",
  [CLASS_BLOCK_KIND.EXERCISE]: "Ejercicio",
};

/** «tus alumnos» → «Tus alumnos», for the label that opens a sentence; a name is already capitalised. */
function capitalize(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * The diagram block (2026-10-19), front-only: it has no kind in the catalog
 * yet, so it is offered as a kind of its own that nothing stores. Choosing it
 * draws the diagram editor; «Agregar bloque» says it is not saved yet.
 */
const DIAGRAM_KIND = "DIAGRAM";
type PopupKind = ClassBlockKindCode | typeof DIAGRAM_KIND;

/** What a teacher may add: the exercise block (D29) only while «Ejercicios» is on. */
export const ADDABLE_BLOCK_KINDS: ClassBlockKindCode[] = [
  CLASS_BLOCK_KIND.TEXT,
  CLASS_BLOCK_KIND.GAME_REF,
  CLASS_BLOCK_KIND.LESSON_REF,
  CLASS_BLOCK_KIND.VIDEO,
  ...(EXERCISES_ENABLED ? [CLASS_BLOCK_KIND.EXERCISE] : []),
];

/**
 * «Agregar un bloque» / «Editar el bloque»: what it is, when the student
 * sees it, and its fields by kind. No trigger of its own: the block list
 * opens it through its `ref` with a preset. Submitted by hand, so React's
 * reset of the form does not reach the controlled pieces inside the fields.
 * An exercise block (D29) is the student's task, so «Guion del profesor» is
 * not offered for it (D30).
 */
export function BlockPopup({ ref, ...props }: BlockPopupProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  const [use, setUse] = useState(0);
  const [preset, setPreset] = useState<BlockPopupPreset>({ visibility: CLASS_BLOCK_VISIBILITY.BEFORE });
  const router = useRouter();
  const pathname = usePathname();
  useImperativeHandle(
    ref,
    () => ({
      open: (event, next) => {
        setPreset(next);
        popup.current?.open(event);
      },
      close: () => popup.current?.close(),
    }),
    [],
  );
  return (
    <PlatformPopup
      ref={popup}
      title={preset.block ? "Editar el bloque" : "Agregar un bloque"}
      size="lg"
      phone="sheet"
      onClose={() => setUse((n) => n + 1)}
    >
      {/* Remounted per use AND per preset: a popup opened on another block or kind starts from it, not from the last one's state. */}
      <BlockPopupForm
        key={`${use}:${preset.kind ?? ""}:${preset.visibility}:${preset.block?.id ?? ""}:${preset.gameId ?? ""}`}
        {...props}
        preset={preset}
        onDone={(notice) => {
          popup.current?.close();
          router.replace(withNoticeParam(pathname, notice.code, notice.args));
        }}
      />
    </PlatformPopup>
  );
}

interface BlockPopupFormProps extends Omit<BlockPopupProps, "ref"> {
  preset: BlockPopupPreset;
  onDone: (notice: NonNullable<PopupFormState["notice"]>) => void;
}

function BlockPopupForm({
  classId,
  options,
  groupSize,
  endHour,
  studentLabel,
  studentPlural = false,
  addClassBlock,
  updateClassBlock,
  fetchReferencePgn,
  preset,
  onDone,
}: BlockPopupFormProps) {
  const editing = preset.block;
  const action = editing ? updateClassBlock.bind(null, classId, editing.id) : addClassBlock.bind(null, classId);
  const [state, formAction] = useActionState(action, POPUP_FORM_IDLE);
  const [pending, startSubmit] = useTransition();
  const values = state.values ?? {};
  const sentKind = typeof values.kind === "string" ? (values.kind as ClassBlockKindCode) : undefined;
  const [kind, setKind] = useState<PopupKind | undefined>(
    sentKind ?? editing?.kind ?? preset.kind ?? (preset.gameId ? CLASS_BLOCK_KIND.GAME_REF : undefined),
  );
  const sentVisibility =
    typeof values.visibility === "string" ? (values.visibility as ClassBlockVisibilityCode) : undefined;
  const initialVisibility = sentVisibility ?? editing?.visibility ?? preset.visibility;

  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);

  const message = (field: string) => {
    const error = state.fieldErrors?.[field];
    return error ? (CLASS_FIELD_ERRORS[error.code] ?? error.code) : undefined;
  };
  // A refusal of the kind while editing has no field to land on (the kind is a hidden input then), so it is the form's.
  const formError = state.formError
    ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code)
    : editing
      ? message("kind")
      : undefined;
  const errors = Object.fromEntries(
    ["text", "videoUrl", "pgn", "gameId", "lessonId", "caption", "exercises"].map((field) => [field, message(field)]),
  );
  const isExercise = kind === CLASS_BLOCK_KIND.EXERCISE;
  const isDiagram = kind === DIAGRAM_KIND;
  const [diagramNotice, setDiagramNotice] = useState(false);
  const visibilityOptions = [
    {
      value: CLASS_BLOCK_VISIBILITY.BEFORE,
      label: "Para preparar",
      description: `${capitalize(studentLabel)} lo ${studentPlural ? "ven" : "ve"} desde ahora.`,
    },
    {
      value: CLASS_BLOCK_VISIBILITY.AFTER,
      label: "Después de la clase",
      description: `Lo verá cuando termine la clase, a las ${endHour}.`,
    },
    ...(isExercise
      ? []
      : [{ value: CLASS_BLOCK_VISIBILITY.TEACHER, label: "Guion del profesor", description: "Sólo lo ves tú." }]),
  ];
  // A script of exercises is nobody's to solve: when the kind turns into
  // exercises, a visibility of TEACHER goes back to «Para preparar».
  const visibilityValue =
    isExercise && initialVisibility === CLASS_BLOCK_VISIBILITY.TEACHER
      ? CLASS_BLOCK_VISIBILITY.BEFORE
      : initialVisibility;

  return (
    <PlatformForm
      className="block-popup__form"
      onSubmit={(event) => {
        event.preventDefault();
        if (isDiagram) return setDiagramNotice(true);
        const data = new FormData(event.currentTarget);
        startSubmit(() => formAction(data));
      }}
    >
      {formError && <PlatformNotice message={formError} />}
      {isDiagram && diagramNotice && (
        <PlatformNotice
          variant="info"
          message="El diagrama todavía no se guarda: el editor es una vista previa. Lo que se guardaría está en «Lo que se guarda»."
        />
      )}
      {editing ? (
        <input type="hidden" name="kind" value={editing.kind} />
      ) : (
        <PlatformFormGroup
          label="¿Qué vas a agregar?"
          serverError={message("kind")}
          valueMissing="Elige qué vas a agregar."
        >
          <PlatformChoiceCards
            name="kind"
            layout="line"
            required
            defaultValue={kind}
            onValueChange={(value) => {
              setKind(value as PopupKind);
              setDiagramNotice(false);
            }}
            options={[
              ...ADDABLE_BLOCK_KINDS.map((item) => ({ value: item, label: KIND_LABELS[item] })),
              { value: DIAGRAM_KIND, label: "Diagrama" },
            ]}
          />
        </PlatformFormGroup>
      )}

      <PlatformFormGroup
        label="¿Cuándo lo ve el alumno?"
        serverError={message("visibility")}
        valueMissing="Elige cuándo lo ve el alumno."
      >
        {/* Mounted again when the options change with the kind: the cards start from the value they are given. */}
        <PlatformChoiceCards
          key={isExercise ? "exercise" : "any"}
          name="visibility"
          required
          defaultValue={visibilityValue}
          options={visibilityOptions}
        />
      </PlatformFormGroup>

      {isDiagram && <DiagramEditor />}

      {kind && kind !== DIAGRAM_KIND && (
        <BlockForm
          key={kind}
          kind={kind}
          options={options}
          block={editing ?? (preset.gameId ? { gameId: preset.gameId } : undefined)}
          values={values}
          errors={errors}
          groupSize={groupSize}
          fetchReferencePgn={fetchReferencePgn}
        />
      )}

      <div className="block-popup__foot">
        <SubmitButton
          className="platform-button platform-button_variant_ink"
          pendingLabel={editing ? "Guardando…" : "Agregando…"}
          pending={pending}
          disabled={!kind}
        >
          {editing ? "Guardar bloque" : "Agregar bloque"}
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
