"use client";

import { useActionState, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarPenIcon } from "@/components/icons/calendar-pen-icon.comp";
import {
  ClassSlotFields,
  type ClassSlotValue,
} from "@/components/platform/shared/class-slot-fields/class-slot-fields.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { CLASS_FIELD_ERRORS } from "@/constants/platform/class-messages.const";
import { formatClassDay, formatClassWhen } from "@/lib/format-class-when";
import { formatDateTimeLocal } from "@/lib/timezone";
import { slotInstant, validateClassSchedule } from "@/services/shared/class-schedule-rules";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import type { BusySlotView } from "@/services/staff-payments/staff-payments.types";
import "./reschedule-class-popup.comp.css";

export interface RescheduleClassPopupHandle {
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
}

export interface RescheduleClassPopupProps {
  classId: string;
  classTitle: string;
  startIso: string;
  durationMin: number;
  teacherId: string;
  teacherName: string;
  timeZone: string;
  nowIso: string;
  rescheduleClass: (classId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  loadTeacherBusy: (teacherId: string) => Promise<BusySlotView[]>;
  ref?: Ref<RescheduleClassPopupHandle>;
}

function fieldMessage(state: PopupFormState, field: string): string | undefined {
  const error = state.fieldErrors?.[field];
  return error ? (CLASS_FIELD_ERRORS[error.code] ?? error.code) : undefined;
}

/**
 * «Reprogramar la clase» (ADM-4): another day, hour or duration for the
 * whole class, with the line «Antes → Ahora», the teacher's overlaps said
 * and never blocking, and a note the students read beside the class. Only a
 * class that has not started moves; the writer keeps the previous date.
 */
export function RescheduleClassPopup({ ref, ...props }: RescheduleClassPopupProps) {
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
      title="Reprogramar la clase"
      size="md"
      phone="sheet"
      onClose={() => setUse((n) => n + 1)}
    >
      <RescheduleClassForm
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

interface RescheduleClassButtonProps extends Omit<RescheduleClassPopupProps, "ref"> {
  /** `button`: the head's, with the calendar; `row`: the word of the lane. */
  variant?: "button" | "row";
}

/** A launcher with the popup behind it. */
export function RescheduleClassButton({ variant = "button", ...props }: RescheduleClassButtonProps) {
  const popup = useRef<RescheduleClassPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className={variant === "row" ? "platform-row-action" : "platform-button"}
        onClick={(event) => popup.current?.open(event)}
      >
        {variant === "button" && <CalendarPenIcon variant="classic-solid" className="platform-button__icon" />}
        Reprogramar
      </button>
      <RescheduleClassPopup ref={popup} {...props} />
    </>
  );
}

interface RescheduleClassFormProps extends Omit<RescheduleClassPopupProps, "ref"> {
  onDone: (notice: NonNullable<PopupFormState["notice"]>) => void;
}

function RescheduleClassForm({
  classId,
  classTitle,
  startIso,
  durationMin,
  teacherId,
  teacherName,
  timeZone,
  nowIso,
  rescheduleClass,
  loadTeacherBusy,
  onDone,
}: RescheduleClassFormProps) {
  const [state, formAction] = useActionState(rescheduleClass.bind(null, classId), POPUP_FORM_IDLE);
  const now = new Date(nowIso);
  const current = new Date(startIso);
  const local = formatDateTimeLocal(current, timeZone);
  const [slot, setSlot] = useState<Partial<ClassSlotValue>>({
    date: (state.values?.date as string | undefined) ?? local.slice(0, 10),
    time: (state.values?.time as string | undefined) ?? local.slice(11, 16),
    durationMin: Number(state.values?.duration ?? durationMin),
  });
  const [busy, setBusy] = useState<BusySlotView[]>([]);

  useEffect(() => {
    let alive = true;
    loadTeacherBusy(teacherId).then((list) => {
      if (alive) setBusy(list);
    });
    return () => {
      alive = false;
    };
  }, [teacherId, loadTeacherBusy]);

  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);

  const start = slot.date && slot.time ? slotInstant(slot.date, slot.time, timeZone) : null;
  const before = formatClassWhen({ start: current, durationMin, timeZone, now });
  const after =
    start && slot.durationMin ? formatClassWhen({ start, durationMin: slot.durationMin, timeZone, now }) : null;
  const warnings =
    start && slot.durationMin
      ? validateClassSchedule({
          scheduledAt: start,
          durationMin: slot.durationMin,
          meetingVisibleFrom: null,
          now,
          // The class itself is on the teacher's calendar: it is not its own overlap.
          teacherBusy: busy
            .filter((item) => item.startIso !== startIso)
            .map((item) => ({ title: item.title, start: new Date(item.startIso), end: new Date(item.endIso) })),
          studentBusy: [],
        }).warnings.map((warning) =>
          warning.kind === "teacherOverlap"
            ? `${teacherName} ya tiene «${warning.classTitle}» a esa hora el ${formatClassDay(start, timeZone, now)}.`
            : warning.kind === "studentOverlap"
              ? `${warning.studentName} ya tiene «${warning.classTitle}» a esa hora.`
              : "Esa fecha ya pasó.",
        )
      : [];
  const formError = state.formError ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code) : undefined;

  return (
    <PlatformForm action={formAction} className="reschedule-class__form">
      <p className="reschedule-class__class">{classTitle}</p>
      {formError && <PlatformNotice message={formError} />}
      <ClassSlotFields
        namePrefix=""
        defaultValue={slot}
        timeZone={timeZone}
        onChange={setSlot}
        warnings={warnings}
        serverError={fieldMessage(state, "date")}
      />
      <p className="reschedule-class__change" aria-live="polite">
        <span className="reschedule-class__before">{before}</span>
        <span aria-hidden="true"> → </span>
        <span className="reschedule-class__after">{after ?? "Elige el día y la hora."}</span>
      </p>
      <PlatformFormField
        name="note"
        label="Nota para los alumnos"
        hint="La leen junto a la clase."
        serverError={fieldMessage(state, "note")}
      >
        <textarea rows={2} maxLength={300} defaultValue={(state.values?.note as string | undefined) ?? ""} />
      </PlatformFormField>
      <div className="reschedule-class__foot">
        <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Reprogramando…">
          Reprogramar
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
