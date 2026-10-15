"use client";

import { useActionState, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { CLASS_FIELD_ERRORS } from "@/constants/platform/class-messages.const";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import type { TeacherOption } from "@/services/staff-payments/staff-payments.types";
import "./change-teacher-popup.comp.css";

export interface ChangeTeacherPopupHandle {
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
}

export interface ChangeTeacherPopupProps {
  classId: string;
  classTitle: string;
  /** The current teacher; left out of the choices when deactivated. */
  current: { id: string; displayName: string; isActive: boolean };
  teachers: TeacherOption[];
  setClassTeacher: (classId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  ref?: Ref<ChangeTeacherPopupHandle>;
}

/**
 * «Cambiar profesor» (ADM-4): one of the active teachers; the content stays
 * with the class. The way a class of a deactivated teacher gets one again.
 */
export function ChangeTeacherPopup({ ref, ...props }: ChangeTeacherPopupProps) {
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
    <PlatformPopup ref={popup} title="Cambiar profesor" size="sm" onClose={() => setUse((n) => n + 1)}>
      <ChangeTeacherForm
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

/** The lane's «Cambiar», with the popup behind it. */
export function ChangeTeacherButton(props: Omit<ChangeTeacherPopupProps, "ref">) {
  const popup = useRef<ChangeTeacherPopupHandle>(null);
  return (
    <>
      <button type="button" className="platform-row-action" onClick={(event) => popup.current?.open(event)}>
        Cambiar
      </button>
      <ChangeTeacherPopup ref={popup} {...props} />
    </>
  );
}

interface ChangeTeacherFormProps extends Omit<ChangeTeacherPopupProps, "ref"> {
  onDone: (notice: NonNullable<PopupFormState["notice"]>) => void;
}

function ChangeTeacherForm({
  classId,
  classTitle,
  current,
  teachers,
  setClassTeacher,
  onDone,
}: ChangeTeacherFormProps) {
  const [state, formAction] = useActionState(setClassTeacher.bind(null, classId), POPUP_FORM_IDLE);
  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);
  const error = state.fieldErrors?.teacherId;
  const formError = state.formError ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code) : undefined;

  return (
    <PlatformForm action={formAction} className="change-teacher__form">
      <p className="change-teacher__class">
        {classTitle} ·{" "}
        {current.isActive ? `hoy la da ${current.displayName}` : `${current.displayName} está desactivado`}
      </p>
      {formError && <PlatformNotice message={formError} />}
      <PlatformFormField
        name="teacherId"
        label="Profesor"
        hint="El contenido preparado se queda con la clase."
        serverError={error ? (CLASS_FIELD_ERRORS[error.code] ?? error.code) : undefined}
      >
        <PlatformSelect
          options={teachers.map((teacher) => ({ value: teacher.id, label: teacher.displayName }))}
          defaultValue={(state.values?.teacherId as string | undefined) ?? (current.isActive ? current.id : undefined)}
          placeholder="Elige un profesor"
          required
        />
      </PlatformFormField>
      <div className="change-teacher__foot">
        <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Cambiando…">
          Cambiar profesor
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
