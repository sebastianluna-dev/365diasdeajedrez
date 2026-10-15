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
import { formatClassStamp, formatClassWhen } from "@/lib/format-class-when";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { MEETING_VISIBLE_OPTIONS, meetingVisibleOptionOf } from "@/services/shared/meeting-visible-from";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import type { MeetingLinkCurrent, SetMeetingAction } from "./meeting-link-popup.types";
import "./meeting-link-popup.comp.css";

export interface MeetingLinkPopupHandle {
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
}

export interface MeetingLinkPopupProps {
  classId: string;
  /** The class, for the line under the title: «Plan de aperturas con blancas · Hoy · 17:00–18:00». */
  classTitle: string;
  current: MeetingLinkCurrent;
  timeZone: string;
  nowIso: string;
  /** The server action; a stub in Storybook. */
  setMeeting: SetMeetingAction;
  ref?: Ref<MeetingLinkPopupHandle>;
}

/** A field's words for the code the server returned. */
function fieldMessage(state: PopupFormState, field: string): string | undefined {
  const error = state.fieldErrors?.[field];
  return error ? (CLASS_FIELD_ERRORS[error.code] ?? error.code) : undefined;
}

/**
 * «Agregar el enlace de la reunión», or «Cambiar …» when the class has one:
 * the link and when the students get to see it. No trigger of its own; a
 * host opens it through its `ref` (`MeetingLinkButton` draws one). The form
 * is remounted on every use; on success the host closes it and puts the
 * notice in the address, with the class's id so the page can name it.
 */
export function MeetingLinkPopup({ ref, ...props }: MeetingLinkPopupProps) {
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
      title={props.current.meetingUrl ? "Cambiar el enlace de la reunión" : "Agregar el enlace de la reunión"}
      size="sm"
      phone="sheet"
      onClose={() => setUse((count) => count + 1)}
    >
      <MeetingLinkForm
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

interface MeetingLinkButtonProps extends Omit<MeetingLinkPopupProps, "ref"> {
  /** «Agregar» or «Cambiar»; by the current link when absent. */
  label?: string;
  /** `row`: the word at the end of a row or a lane; `button`: a small button. */
  variant?: "row" | "button";
}

/** A launcher with the popup behind it. */
export function MeetingLinkButton({ label, variant = "row", ...props }: MeetingLinkButtonProps) {
  const popup = useRef<MeetingLinkPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className={variant === "row" ? "platform-row-action" : "platform-button platform-button_size_sm"}
        onClick={(event) => popup.current?.open(event)}
      >
        {label ?? (props.current.meetingUrl ? "Cambiar" : "Agregar")}
      </button>
      <MeetingLinkPopup ref={popup} {...props} />
    </>
  );
}

interface MeetingLinkFormProps extends Omit<MeetingLinkPopupProps, "ref"> {
  onDone: (notice: NonNullable<PopupFormState["notice"]>) => void;
}

function MeetingLinkForm({ classId, classTitle, current, timeZone, nowIso, setMeeting, onDone }: MeetingLinkFormProps) {
  const [state, formAction] = useActionState(setMeeting.bind(null, classId), POPUP_FORM_IDLE);
  const now = new Date(nowIso);
  const start = new Date(current.startIso);

  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);

  const chosen = meetingVisibleOptionOf(current.visibleFromIso ? new Date(current.visibleFromIso) : null, start);
  const options = [
    ...MEETING_VISIBLE_OPTIONS,
    ...(chosen === "keep" && current.visibleFromIso
      ? [{ value: "keep", label: `Desde el ${formatClassStamp(new Date(current.visibleFromIso), timeZone, now)}` }]
      : []),
  ];
  const formError = state.formError ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code) : undefined;

  return (
    <PlatformForm action={formAction} className="meeting-link__form">
      <p className="meeting-link__class">
        {classTitle} · {formatClassWhen({ start, durationMin: current.durationMin, timeZone, now })}
      </p>
      {formError && <PlatformNotice message={formError} />}

      <PlatformFormField
        name="meetingUrl"
        label="Enlace de la reunión"
        hint="Zoom o Meet: la plataforma se reconoce por el enlace."
        serverError={fieldMessage(state, "meetingUrl")}
      >
        <input
          type="url"
          maxLength={2000}
          required
          placeholder="https://zoom.us/j/…"
          defaultValue={(state.values?.meetingUrl as string | undefined) ?? current.meetingUrl ?? ""}
        />
      </PlatformFormField>

      <PlatformFormField
        name="visibleFrom"
        label="Los alumnos ven el enlace"
        serverError={fieldMessage(state, "visibleFrom")}
      >
        <PlatformSelect
          options={options}
          defaultValue={(state.values?.visibleFrom as string | undefined) ?? chosen}
          required
        />
      </PlatformFormField>

      <div className="meeting-link__foot">
        <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Guardando…">
          {current.meetingUrl ? "Guardar el enlace" : "Agregar el enlace"}
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
