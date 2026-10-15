"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ClassSlotFields,
  type ClassSlotValue,
} from "@/components/platform/shared/class-slot-fields/class-slot-fields.comp";
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
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { CLASS_FIELD_ERRORS } from "@/constants/platform/class-messages.const";
import { formatClassWhen } from "@/lib/format-class-when";
import { slotInstant } from "@/services/shared/class-schedule-rules";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import type {
  OpenGroupClassOption,
  RhythmDefaults,
  TeacherOption,
} from "@/services/staff-payments/staff-payments.types";
import "./schedule-seat-popup.comp.css";

export interface ScheduleSeatPopupProps {
  paymentId: string;
  studentName: string;
  /** «Clase 4 de 4 del pago del jue 1 oct · Profesor: GM Profesor Demo». */
  seatLabel: string;
  teachers: TeacherOption[];
  rhythm: RhythmDefaults;
  groupClasses: OpenGroupClassOption[];
  timeZone: string;
  nowIso: string;
  /** The server action, bound by the host; a stub in Storybook. */
  scheduleSeat: (paymentId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  /** What the launcher says: «Programar». */
  launcherLabel?: string;
  launcherClassName?: string;
}

/** A field's words for the code the server returned. */
export function fieldMessage(state: PopupFormState, field: string): string | undefined {
  const error = state.fieldErrors?.[field];
  return error ? (CLASS_FIELD_ERRORS[error.code] ?? error.code) : undefined;
}

/**
 * «Programar una clase de …» (ADM-6): a paid class without a date gets one,
 * in a new individual class or in a group class with a seat free. The form
 * is remounted on every opening (its key moves in `onClose`), so a done
 * state never survives to the next use; on success the host closes it and
 * puts the notice in the address.
 */
export function ScheduleSeatPopup({
  paymentId,
  studentName,
  seatLabel,
  teachers,
  rhythm,
  groupClasses,
  timeZone,
  nowIso,
  scheduleSeat,
  launcherLabel = "Programar",
  launcherClassName = "platform-button platform-button_size_sm",
}: ScheduleSeatPopupProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  const [use, setUse] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <button type="button" className={launcherClassName} onClick={(event) => popup.current?.open(event)}>
        {launcherLabel}
      </button>
      <PlatformPopup
        ref={popup}
        title={`Programar una clase de ${studentName}`}
        size="md"
        phone="sheet"
        onClose={() => setUse((count) => count + 1)}
      >
        <ScheduleSeatForm
          key={use}
          paymentId={paymentId}
          seatLabel={seatLabel}
          teachers={teachers}
          rhythm={rhythm}
          groupClasses={groupClasses}
          timeZone={timeZone}
          nowIso={nowIso}
          scheduleSeat={scheduleSeat}
          onDone={(notice) => {
            popup.current?.close();
            router.replace(withNoticeParam(pathname, notice.code, notice.args));
          }}
        />
      </PlatformPopup>
    </>
  );
}

interface ScheduleSeatFormProps extends Pick<
  ScheduleSeatPopupProps,
  "paymentId" | "seatLabel" | "teachers" | "rhythm" | "groupClasses" | "timeZone" | "nowIso" | "scheduleSeat"
> {
  onDone: (notice: NonNullable<PopupFormState["notice"]>) => void;
}

function ScheduleSeatForm({
  paymentId,
  seatLabel,
  teachers,
  rhythm,
  groupClasses,
  timeZone,
  nowIso,
  scheduleSeat,
  onDone,
}: ScheduleSeatFormProps) {
  const [state, formAction] = useActionState(scheduleSeat.bind(null, paymentId), POPUP_FORM_IDLE);
  const openGroups = groupClasses.filter((cls) => !cls.disabledReason);
  const initialWhere = state.values?.where === "group" ? "group" : "new";
  const [where, setWhere] = useState<"new" | "group">(initialWhere);
  const [slot, setSlot] = useState<Partial<ClassSlotValue>>({
    date: (state.values?.date as string | undefined) ?? rhythm.firstDate,
    time: (state.values?.time as string | undefined) ?? rhythm.time,
    durationMin: Number(state.values?.duration ?? rhythm.durationMin),
  });
  const previewId = useId();

  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);

  const start = slot.date && slot.time ? slotInstant(slot.date, slot.time, timeZone) : null;
  const preview =
    start && slot.durationMin
      ? formatClassWhen({ start, durationMin: slot.durationMin, timeZone, now: new Date(nowIso), withZone: true })
      : null;
  const formError = state.formError ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code) : undefined;

  return (
    <PlatformForm action={formAction} className="schedule-seat__form">
      <p className="schedule-seat__seat">{seatLabel}</p>
      {formError && <PlatformNotice message={formError} />}

      <PlatformFormGroup label="¿Dónde?" serverError={fieldMessage(state, "where")}>
        <PlatformChoiceCards
          name="where"
          defaultValue={initialWhere}
          onValueChange={(value) => setWhere(value === "group" ? "group" : "new")}
          options={[
            { value: "new", label: "En una clase nueva", description: "Individual, con su día y su hora." },
            {
              value: "group",
              label: "En una clase grupal",
              description:
                openGroups.length > 0
                  ? `${openGroups.length} con plazas libres`
                  : "No hay otra clase grupal con plazas libres",
              disabled: openGroups.length === 0,
            },
          ]}
        />
      </PlatformFormGroup>

      {where === "new" ? (
        <>
          <PlatformFormField name="teacherId" label="Profesor" serverError={fieldMessage(state, "teacherId")}>
            <PlatformSelect
              options={teachers.map((teacher) => ({ value: teacher.id, label: teacher.displayName }))}
              defaultValue={(state.values?.teacherId as string | undefined) ?? rhythm.teacherId ?? undefined}
              placeholder="Elige un profesor"
              required
            />
          </PlatformFormField>
          <ClassSlotFields
            namePrefix=""
            defaultValue={slot}
            timeZone={timeZone}
            onChange={setSlot}
            serverError={fieldMessage(state, "date")}
          />
          <p id={previewId} className="schedule-seat__preview" aria-live="polite">
            {preview ?? "Elige el día y la hora."}
          </p>
          <PlatformFormField
            name="meetingUrl"
            label="Enlace de la reunión"
            hint="Los alumnos lo ven 30 minutos antes de empezar."
            serverError={fieldMessage(state, "meetingUrl")}
          >
            <input type="url" maxLength={2000} defaultValue={(state.values?.meetingUrl as string | undefined) ?? ""} />
          </PlatformFormField>
        </>
      ) : (
        <PlatformFormGroup
          label="Clase grupal"
          serverError={fieldMessage(state, "classId")}
          valueMissing="Elige una clase."
        >
          <PlatformChoiceCards
            name="classId"
            required
            defaultValue={state.values?.classId as string | undefined}
            options={groupClasses.map((cls) => ({
              value: cls.classId,
              label: cls.title,
              meta: formatClassWhen({
                start: new Date(cls.startIso),
                durationMin: cls.durationMin,
                timeZone,
                now: new Date(nowIso),
              }),
              description: cls.disabledReason ?? `${cls.teacherName} · ${cls.seated} de ${cls.capacity} plazas`,
              disabled: Boolean(cls.disabledReason),
            }))}
          />
        </PlatformFormGroup>
      )}

      <div className="schedule-seat__foot">
        <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Programando…">
          Programar clase
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
