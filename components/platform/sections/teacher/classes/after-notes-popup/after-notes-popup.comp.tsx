"use client";

import { useActionState, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import "./after-notes-popup.comp.css";

export interface AfterNotesPopupHandle {
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
}

export interface AfterNotesPopupProps {
  classId: string;
  summary: string | null;
  recordingUrl: string | null;
  updateClassAfterNotes: (classId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  ref?: Ref<AfterNotesPopupHandle>;
}

/** «Después de la clase»: the summary and the recording, both optional, once the class is done. */
export function AfterNotesPopup({ ref, ...props }: AfterNotesPopupProps) {
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
    <PlatformPopup ref={popup} title="Después de la clase" size="md" onClose={() => setUse((n) => n + 1)}>
      <AfterNotesForm
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

/** The lane's «Editar», with the popup behind it. */
export function AfterNotesButton(props: Omit<AfterNotesPopupProps, "ref">) {
  const popup = useRef<AfterNotesPopupHandle>(null);
  return (
    <>
      <button type="button" className="platform-row-action" onClick={(event) => popup.current?.open(event)}>
        Editar
      </button>
      <AfterNotesPopup ref={popup} {...props} />
    </>
  );
}

function AfterNotesForm({
  classId,
  summary,
  recordingUrl,
  updateClassAfterNotes,
  onDone,
}: Omit<AfterNotesPopupProps, "ref"> & { onDone: (notice: NonNullable<PopupFormState["notice"]>) => void }) {
  const [state, formAction] = useActionState(updateClassAfterNotes.bind(null, classId), POPUP_FORM_IDLE);
  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);
  const message = (field: string) => {
    const error = state.fieldErrors?.[field];
    return error ? (CLASS_FIELD_ERRORS[error.code] ?? error.code) : undefined;
  };
  const formError = state.formError ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code) : undefined;
  return (
    <PlatformForm action={formAction} className="after-notes__form">
      {formError && <PlatformNotice message={formError} />}
      <OptionalFields>
        <PlatformFormField
          name="summary"
          label="Resumen para el alumno"
          hint="Qué vieron y qué tiene que repasar."
          serverError={message("summary")}
        >
          <textarea
            rows={5}
            maxLength={5000}
            defaultValue={(state.values?.summary as string | undefined) ?? summary ?? ""}
          />
        </PlatformFormField>
        <PlatformFormField
          name="recordingUrl"
          label="Enlace de la grabación"
          hint="Zoom, Drive o YouTube."
          serverError={message("recordingUrl")}
        >
          <input
            type="url"
            maxLength={2000}
            defaultValue={(state.values?.recordingUrl as string | undefined) ?? recordingUrl ?? ""}
          />
        </PlatformFormField>
      </OptionalFields>
      <div className="after-notes__foot">
        <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Guardando…">
          Guardar
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
