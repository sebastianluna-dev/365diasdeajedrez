"use client";

import { useActionState, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PenIcon } from "@/components/icons/pen-icon.comp";
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
import "./topic-popup.comp.css";

export interface TopicPopupHandle {
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
}

export interface TopicPopupProps {
  classId: string;
  /** The topic as stored, "" when there is none. */
  topic: string;
  description: string | null;
  updateClassTopic: (classId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  ref?: Ref<TopicPopupHandle>;
}

/** «Editar el tema»: the title the students see and the description. */
export function TopicPopup({ ref, ...props }: TopicPopupProps) {
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
    <PlatformPopup ref={popup} title="Editar el tema" size="sm" onClose={() => setUse((n) => n + 1)}>
      <TopicForm
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

/** The square button beside the title, with the popup behind it. */
export function TopicButton(props: Omit<TopicPopupProps, "ref">) {
  const popup = useRef<TopicPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className="platform-button platform-button_variant_quiet platform-button_shape_square"
        aria-label="Editar el tema"
        onClick={(event) => popup.current?.open(event)}
      >
        <PenIcon variant="classic-solid" className="platform-button__icon" />
      </button>
      <TopicPopup ref={popup} {...props} />
    </>
  );
}

function TopicForm({
  classId,
  topic,
  description,
  updateClassTopic,
  onDone,
}: Omit<TopicPopupProps, "ref"> & { onDone: (notice: NonNullable<PopupFormState["notice"]>) => void }) {
  const [state, formAction] = useActionState(updateClassTopic.bind(null, classId), POPUP_FORM_IDLE);
  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);
  const message = (field: string) => {
    const error = state.fieldErrors?.[field];
    return error ? (CLASS_FIELD_ERRORS[error.code] ?? error.code) : undefined;
  };
  const formError = state.formError ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code) : undefined;
  return (
    <PlatformForm action={formAction} className="topic-popup__form">
      {formError && <PlatformNotice message={formError} />}
      <PlatformFormField name="title" label="Título" hint="Lo ven los alumnos." serverError={message("title")}>
        <input
          type="text"
          maxLength={120}
          required
          defaultValue={(state.values?.title as string | undefined) ?? topic}
        />
      </PlatformFormField>
      <PlatformFormField name="description" label="Descripción" serverError={message("description")}>
        <textarea
          rows={3}
          maxLength={500}
          defaultValue={(state.values?.description as string | undefined) ?? description ?? ""}
        />
      </PlatformFormField>
      <div className="topic-popup__foot">
        <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Guardando…">
          Guardar el tema
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
