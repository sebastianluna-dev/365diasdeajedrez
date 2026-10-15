"use client";

import { useActionState, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import {
  PlatformForm,
  PlatformFormField,
  PlatformFormGroup,
} from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { CLASS_FIELD_ERRORS } from "@/constants/platform/class-messages.const";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import "./change-attendance-popup.comp.css";

export interface ChangeAttendancePopupHandle {
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
}

export interface ChangeAttendancePopupProps {
  classId: string;
  student: { id: string; displayName: string };
  /** «Clase de Valentina Cruz · mié 14 oct · 19:00–20:00 · GM Profesor Demo marcó «Faltó»». */
  context: string;
  attended: boolean | null;
  /** Who reads the reason: «Lo ve GM Profesor Demo junto al cambio.» */
  teacherName: string;
  /** Who is changing: «por Staff Demo». */
  staffName: string;
  changeAttendance: (
    classId: string,
    studentId: string,
    prev: PopupFormState,
    formData: FormData,
  ) => Promise<PopupFormState>;
  ref?: Ref<ChangeAttendancePopupHandle>;
}

const word = (attended: boolean | null) => (attended === null ? "«Sin marca»" : attended ? "«Asistió»" : "«Faltó»");

/**
 * «Cambiar la asistencia de …» (ADM-9): the staff's override after a
 * report, with the current mark chosen, a reason the teacher reads, and the
 * three lines that say what it does and does not do: the mark changes and
 * is logged, the paid class stays spent, the student sees it.
 */
export function ChangeAttendancePopup({ ref, ...props }: ChangeAttendancePopupProps) {
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
      title={`Cambiar la asistencia de ${props.student.displayName}`}
      size="sm"
      phone="sheet"
      onClose={() => setUse((n) => n + 1)}
    >
      <ChangeAttendanceForm
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

/** The row's «Cambiar», with the popup behind it. */
export function ChangeAttendanceButton(props: Omit<ChangeAttendancePopupProps, "ref">) {
  const popup = useRef<ChangeAttendancePopupHandle>(null);
  return (
    <>
      <button type="button" className="platform-row-action" onClick={(event) => popup.current?.open(event)}>
        Cambiar
      </button>
      <ChangeAttendancePopup ref={popup} {...props} />
    </>
  );
}

interface ChangeAttendanceFormProps extends Omit<ChangeAttendancePopupProps, "ref"> {
  onDone: (notice: NonNullable<PopupFormState["notice"]>) => void;
}

function ChangeAttendanceForm({
  classId,
  student,
  context,
  attended,
  teacherName,
  staffName,
  changeAttendance,
  onDone,
}: ChangeAttendanceFormProps) {
  const [state, formAction] = useActionState(changeAttendance.bind(null, classId, student.id), POPUP_FORM_IDLE);
  const initial =
    (state.values?.attended as string | undefined) ?? (attended === null ? undefined : attended ? "yes" : "no");
  const [choice, setChoice] = useState<string | undefined>(initial);
  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);
  const message = (field: string) => {
    const error = state.fieldErrors?.[field];
    return error ? (CLASS_FIELD_ERRORS[error.code] ?? error.code) : undefined;
  };
  const formError = state.formError ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code) : undefined;
  const to = choice === undefined ? null : choice === "yes";

  return (
    <PlatformForm action={formAction} className="change-attendance__form">
      <p className="change-attendance__context">{context}</p>
      {formError && <PlatformNotice message={formError} />}
      <PlatformFormGroup label="Asistencia" serverError={message("attended")} valueMissing="Elige «Asistió» o «Faltó».">
        <PlatformChoiceCards
          name="attended"
          layout="line"
          required
          defaultValue={initial}
          onValueChange={setChoice}
          options={[
            { value: "yes", label: "Asistió" },
            { value: "no", label: "Faltó" },
          ]}
        />
      </PlatformFormGroup>
      <PlatformFormField
        name="reason"
        label="Motivo del cambio"
        hint={`Lo ve ${teacherName} junto al cambio.`}
        serverError={message("reason")}
        messages={{ valueMissing: "Escribe el motivo del cambio." }}
      >
        <textarea rows={3} maxLength={300} required defaultValue={(state.values?.reason as string | undefined) ?? ""} />
      </PlatformFormField>
      <ul className="change-attendance__lines">
        <li>
          Queda registrado: {word(attended)} → {to === null ? "…" : word(to)}, por {staffName}, con este motivo.
        </li>
        <li>La clase pagada sigue gastada: la asistencia no mueve el pago.</li>
        {to !== null && (
          <li>
            {student.displayName} verá {to ? "«Asististe»" : "«No asististe»"} en la clase.
          </li>
        )}
      </ul>
      <div className="change-attendance__foot">
        <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Guardando…">
          Guardar el cambio
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
