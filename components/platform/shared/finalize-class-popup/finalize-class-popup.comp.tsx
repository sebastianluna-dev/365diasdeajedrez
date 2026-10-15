"use client";

import { useActionState, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { AttendanceRow } from "@/components/platform/shared/attendance-row/attendance-row.comp";
import { OptionalFields } from "@/components/platform/shared/optional-fields/optional-fields.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { CLASS_FIELD_ERRORS } from "@/constants/platform/class-messages.const";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import type { FinalizeClassAction, FinalizeClassData } from "./finalize-class-popup.types";
import "./finalize-class-popup.comp.css";

export type FinalizeClassMode = "finalize" | "change" | "staff";

export interface FinalizeClassPopupHandle {
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
}

export interface FinalizeClassPopupProps extends FinalizeClassData {
  /**
   * `finalize`: the teacher passes the list and may leave the summary and the
   * recording; `change`: the teacher corrects their own marks of a finished
   * class (D3); `staff`: the staff finalizes on the teacher's behalf, only
   * the list, with a reason (D1).
   */
  mode: FinalizeClassMode;
  action: FinalizeClassAction;
  ref?: Ref<FinalizeClassPopupHandle>;
}

const TITLES: Record<FinalizeClassMode, (teacherName: string) => string> = {
  finalize: () => "Finalizar la clase",
  change: () => "Cambiar la asistencia",
  staff: (teacherName) => `Finalizar la clase en nombre de ${teacherName}`,
};

const SUBMIT: Record<FinalizeClassMode, { label: string; pending: string }> = {
  finalize: { label: "Finalizar la clase", pending: "Finalizando…" },
  change: { label: "Guardar la asistencia", pending: "Guardando…" },
  staff: { label: "Finalizar la clase", pending: "Finalizando…" },
};

/** A field's words for the code the server returned. */
function fieldMessage(state: PopupFormState, field: string): string | undefined {
  const error = state.fieldErrors?.[field];
  return error ? (CLASS_FIELD_ERRORS[error.code] ?? error.code) : undefined;
}

/**
 * «Finalizar la clase» (PROF-3) and its two other uses: the attendance of
 * every student still in the class as `AttendanceRow`s to write — a locked
 * or moved seat reads —, «Marcar a todos» and the count «3 de 4
 * asistieron»; when finalizing, the summary and the recording, optional;
 * when the staff finalizes on the teacher's behalf, the reason. No trigger
 * of its own; `FinalizeClassButton` draws one. The form is remounted on
 * every use; on success the host closes it and puts the notice in the
 * address.
 */
export function FinalizeClassPopup({ ref, ...props }: FinalizeClassPopupProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  const [use, setUse] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  useImperativeHandle(
    ref,
    () => ({ open: (event) => popup.current?.open(event), close: () => popup.current?.close() }),
    [],
  );
  return (
    <PlatformPopup
      ref={popup}
      title={TITLES[props.mode](props.teacherName)}
      size="md"
      phone="sheet"
      onClose={() => setUse((n) => n + 1)}
    >
      <FinalizeClassForm
        key={use}
        {...props}
        onDone={(notice) => {
          popup.current?.close();
          router.replace(withNoticeParam(pathname, notice.code, notice.args));
        }}
      />
    </PlatformPopup>
  );
}

interface FinalizeClassButtonProps extends Omit<FinalizeClassPopupProps, "ref"> {
  /** `accent`: a page's main action; `button`: a plain one; `row`: the word at the end of a row. */
  variant?: "accent" | "button" | "row";
  label?: string;
  /** Open as soon as it is mounted: the page was asked for it (`?finalizar=1`). */
  openOnMount?: boolean;
}

const LAUNCHER_CLASS = {
  accent: "platform-button platform-button_variant_accent",
  button: "platform-button",
  row: "platform-row-action",
} as const;

/** A launcher with the popup behind it: «Finalizar la clase», «Cambiar la asistencia» or «Finalizar». */
export function FinalizeClassButton({
  variant = "button",
  label,
  openOnMount = false,
  ...props
}: FinalizeClassButtonProps) {
  const popup = useRef<FinalizeClassPopupHandle>(null);
  useEffect(() => {
    if (openOnMount) popup.current?.open();
  }, [openOnMount]);
  const word = label ?? (props.mode === "change" ? "Cambiar la asistencia" : "Finalizar la clase");
  return (
    <>
      <button type="button" className={LAUNCHER_CLASS[variant]} onClick={(event) => popup.current?.open(event)}>
        {variant !== "row" && props.mode !== "change" && (
          <CircleCheckIcon variant="classic-solid" className="platform-button__icon" />
        )}
        {word}
      </button>
      <FinalizeClassPopup ref={popup} {...props} />
    </>
  );
}

interface FinalizeClassFormProps extends Omit<FinalizeClassPopupProps, "ref"> {
  onDone: (notice: NonNullable<PopupFormState["notice"]>) => void;
}

function FinalizeClassForm({
  classId,
  classTitle,
  whenLine,
  isGroup,
  teacherName,
  students,
  summary,
  recordingUrl,
  mode,
  action,
  onDone,
}: FinalizeClassFormProps) {
  const [state, formAction] = useActionState(action.bind(null, classId), POPUP_FORM_IDLE);
  const sent = (id: string) => state.values?.[`attendance.${id}`] as "yes" | "no" | undefined;
  const editable = students.filter((student) => !student.mark.locked && !student.mark.moved);
  const [marks, setMarks] = useState<Record<string, "yes" | "no">>(() =>
    Object.fromEntries(
      students.flatMap((student) => {
        const value =
          sent(student.id) ?? (student.mark.attended === null ? undefined : student.mark.attended ? "yes" : "no");
        return value ? [[student.id, value]] : [];
      }),
    ),
  );
  const [allMarked, setAllMarked] = useState(false);

  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);

  const attended = students.filter((student) =>
    student.mark.locked || student.mark.moved ? student.mark.attended === true : marks[student.id] === "yes",
  ).length;
  const counted = students.filter((student) => !student.mark.moved).length;
  const formError = state.formError ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code) : undefined;
  const who = isGroup ? "tus alumnos verán" : `${students[0]?.displayName ?? "El alumno"} verá`;

  return (
    <PlatformForm action={formAction} className="finalize-class__form">
      <p className="finalize-class__context">
        {classTitle} · {whenLine}
      </p>
      {formError && <PlatformNotice message={formError} />}

      <section className="finalize-class__section" aria-labelledby={`finalize-${classId}-who`}>
        <div className="finalize-class__section-head">
          <h3 id={`finalize-${classId}-who`} className="finalize-class__heading">
            {mode === "change" ? "Asistencia" : "¿Quién vino?"}
          </h3>
          {isGroup && editable.length > 1 && (
            <button
              type="button"
              className="platform-button platform-button_size_sm"
              onClick={() => {
                setAllMarked(true);
                setMarks((current) => ({
                  ...current,
                  ...Object.fromEntries(editable.map((student) => [student.id, "yes" as const])),
                }));
              }}
            >
              Marcar a todos
            </button>
          )}
        </div>
        <div className="finalize-class__rows">
          {students.map((student) => (
            <AttendanceRow
              key={student.id}
              student={{ id: student.id, displayName: student.displayName }}
              details={student.details}
              mark={student.mark}
              mode="edit"
              defaultValue={
                allMarked && !student.mark.locked && !student.mark.moved
                  ? "yes"
                  : (sent(student.id) ?? (mode === "change" ? marks[student.id] : undefined))
              }
              onValueChange={(value) => setMarks((current) => ({ ...current, [student.id]: value }))}
              serverError={fieldMessage(state, `attendance.${student.id}`)}
            />
          ))}
        </div>
        {isGroup && (
          <p className="finalize-class__count" aria-live="polite">
            {attended} de {counted} asistieron
          </p>
        )}
      </section>

      {mode === "finalize" && (
        <OptionalFields>
          <PlatformFormField
            name="summary"
            label="Resumen para el alumno"
            hint="Qué vieron y qué tiene que repasar. Puedes escribirlo después."
            serverError={fieldMessage(state, "summary")}
          >
            <textarea
              rows={4}
              maxLength={5000}
              defaultValue={(state.values?.summary as string | undefined) ?? summary ?? ""}
            />
          </PlatformFormField>
          <PlatformFormField
            name="recordingUrl"
            label="Enlace de la grabación"
            hint="Zoom, Drive o YouTube."
            serverError={fieldMessage(state, "recordingUrl")}
          >
            <input
              type="url"
              maxLength={2000}
              defaultValue={(state.values?.recordingUrl as string | undefined) ?? recordingUrl ?? ""}
            />
          </PlatformFormField>
        </OptionalFields>
      )}

      {mode === "staff" && (
        <PlatformFormField
          name="reason"
          label="Motivo"
          hint={`Lo ve ${teacherName} junto a las marcas.`}
          serverError={fieldMessage(state, "reason")}
          messages={{ valueMissing: "Escribe por qué finalizas la clase en su nombre." }}
        >
          <textarea
            rows={2}
            maxLength={300}
            required
            defaultValue={(state.values?.reason as string | undefined) ?? ""}
          />
        </PlatformFormField>
      )}

      <p className="finalize-class__line">
        {mode === "finalize" && `Al finalizar, ${who} si asistió, tu resumen y la grabación.`}
        {mode === "change" && "Cambiar una marca no duplica la actividad del alumno."}
        {mode === "staff" && `${teacherName} verá las marcas y tu motivo; podrá cambiarlas después.`}
      </p>

      <div className="finalize-class__foot">
        <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel={SUBMIT[mode].pending}>
          {SUBMIT[mode].label}
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
