"use client";

import { useActionState, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarPenIcon } from "@/components/icons/calendar-pen-icon.comp";
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
import { formatClassDay, formatClassWhen } from "@/lib/format-class-when";
import { formatDateTimeLocal } from "@/lib/timezone";
import { slotInstant } from "@/services/shared/class-schedule-rules";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import type { OpenGroupClassOption, TeacherOption } from "@/services/staff-payments/staff-payments.types";
import "./reschedule-seat-popup.comp.css";

export interface RescheduleSeatPopupHandle {
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
}

export interface RescheduleSeatPopupProps {
  classId: string;
  student: { id: string; displayName: string };
  /** «Faltó el mié 14 oct · es la clase 4 de 4 de su pago del mar 15 sep · Profesor: GM Profesor Demo». */
  context: string;
  /** The missed class, whose day and hour the new one opens with. */
  startIso: string;
  durationMin: number;
  /** The old class's teacher; when deactivated, the form asks for one. */
  teacher: { id: string; displayName: string; isActive: boolean };
  teachers: TeacherOption[];
  groupClasses: OpenGroupClassOption[];
  /** The seat spends a payment: it may go back to it («Dejarla por programar», D4). */
  hasPayment: boolean;
  timeZone: string;
  nowIso: string;
  rescheduleStudentSeat: (
    classId: string,
    studentId: string,
    prev: PopupFormState,
    formData: FormData,
  ) => Promise<PopupFormState>;
  ref?: Ref<RescheduleSeatPopupHandle>;
}

function fieldMessage(state: PopupFormState, field: string): string | undefined {
  const error = state.fieldErrors?.[field];
  return error ? (CLASS_FIELD_ERRORS[error.code] ?? error.code) : undefined;
}

/**
 * «Reprogramar la clase de …» (ADM-10): a no-show's seat goes to a new
 * individual class — the old one's teacher, topic and link, on the day and
 * hour chosen —, to a group class with a seat free, or back to its payment.
 * It keeps its coverage: it spends no other class; the old row stays as
 * «Faltó · reprogramada».
 */
export function RescheduleSeatPopup({ ref, ...props }: RescheduleSeatPopupProps) {
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
      title={`Reprogramar la clase de ${props.student.displayName}`}
      size="md"
      phone="sheet"
      onClose={() => setUse((n) => n + 1)}
    >
      <RescheduleSeatForm
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

interface RescheduleSeatButtonProps extends Omit<RescheduleSeatPopupProps, "ref"> {
  /** `row`: the word at the end of the seat's row; `accent`: the head's main action. */
  variant?: "row" | "accent";
}

/** A launcher with the popup behind it. */
export function RescheduleSeatButton({ variant = "row", ...props }: RescheduleSeatButtonProps) {
  const popup = useRef<RescheduleSeatPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className={variant === "row" ? "platform-row-action" : "platform-button platform-button_variant_accent"}
        onClick={(event) => popup.current?.open(event)}
      >
        {variant === "accent" && <CalendarPenIcon variant="classic-solid" className="platform-button__icon" />}
        Reprogramar
      </button>
      <RescheduleSeatPopup ref={popup} {...props} />
    </>
  );
}

interface RescheduleSeatFormProps extends Omit<RescheduleSeatPopupProps, "ref"> {
  onDone: (notice: NonNullable<PopupFormState["notice"]>) => void;
}

function RescheduleSeatForm({
  classId,
  student,
  context,
  startIso,
  durationMin,
  teacher,
  teachers,
  groupClasses,
  hasPayment,
  timeZone,
  nowIso,
  rescheduleStudentSeat,
  onDone,
}: RescheduleSeatFormProps) {
  const [state, formAction] = useActionState(rescheduleStudentSeat.bind(null, classId, student.id), POPUP_FORM_IDLE);
  const now = new Date(nowIso);
  const missed = new Date(startIso);
  const local = formatDateTimeLocal(missed, timeZone);
  const sentWhere = state.values?.where as string | undefined;
  const initialWhere: "new" | "group" | "later" = sentWhere === "group" || sentWhere === "later" ? sentWhere : "new";
  const [where, setWhere] = useState<"new" | "group" | "later">(initialWhere);
  const [slot, setSlot] = useState<Partial<ClassSlotValue>>({
    date: (state.values?.date as string | undefined) ?? local.slice(0, 10),
    time: (state.values?.time as string | undefined) ?? local.slice(11, 16),
    durationMin: Number(state.values?.duration ?? durationMin),
  });
  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);

  const openGroups = groupClasses.filter((cls) => !cls.disabledReason);
  const start = slot.date && slot.time ? slotInstant(slot.date, slot.time, timeZone) : null;
  const preview =
    start && slot.durationMin
      ? formatClassWhen({ start, durationMin: slot.durationMin, timeZone, now, withZone: true })
      : null;
  const missedDay = formatClassDay(missed, timeZone, now);
  const formError = state.formError ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code) : undefined;

  return (
    <PlatformForm action={formAction} className="reschedule-seat__form">
      <p className="reschedule-seat__context">{context}</p>
      {formError && <PlatformNotice message={formError} />}

      <PlatformFormGroup label="¿Dónde?" serverError={fieldMessage(state, "where")}>
        <PlatformChoiceCards
          name="where"
          defaultValue={initialWhere}
          onValueChange={(value) => setWhere(value === "group" ? "group" : value === "later" ? "later" : "new")}
          options={[
            { value: "new", label: "En una clase nueva", description: "Individual, con su día y su hora." },
            {
              value: "group",
              label: "En una clase grupal",
              description:
                openGroups.length > 0
                  ? openGroups.length === 1 && openGroups[0]
                    ? `${openGroups[0].title} · ${formatClassDay(new Date(openGroups[0].startIso), timeZone, now)} · ${openGroups[0].capacity - openGroups[0].seated === 1 ? "1 plaza libre" : `${openGroups[0].capacity - openGroups[0].seated} plazas libres`}`
                    : `${openGroups.length} con plazas libres`
                  : "No hay otra clase grupal con plazas libres",
              disabled: openGroups.length === 0,
            },
            ...(hasPayment
              ? [
                  {
                    value: "later",
                    label: "Dejarla por programar",
                    description: "Vuelve a su pago; la fecha se fija después.",
                  },
                ]
              : []),
          ]}
        />
      </PlatformFormGroup>

      {where === "new" && (
        <>
          {!teacher.isActive && (
            <PlatformFormField
              name="teacherId"
              label="Profesor"
              hint={`${teacher.displayName} está desactivado.`}
              serverError={fieldMessage(state, "teacherId")}
            >
              <PlatformSelect
                options={teachers.map((item) => ({ value: item.id, label: item.displayName }))}
                defaultValue={state.values?.teacherId as string | undefined}
                placeholder="Elige un profesor"
                required
              />
            </PlatformFormField>
          )}
          <ClassSlotFields
            namePrefix=""
            defaultValue={slot}
            timeZone={timeZone}
            onChange={setSlot}
            serverError={fieldMessage(state, "date")}
          />
          <p className="reschedule-seat__preview" aria-live="polite">
            {preview ?? "Elige el día y la hora."}
          </p>
        </>
      )}
      {where === "group" && (
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
              meta: formatClassWhen({ start: new Date(cls.startIso), durationMin: cls.durationMin, timeZone, now }),
              description: cls.disabledReason ?? `${cls.teacherName} · ${cls.seated} de ${cls.capacity} plazas`,
              disabled: Boolean(cls.disabledReason),
            }))}
          />
        </PlatformFormGroup>
      )}
      {where !== "later" && (
        <PlatformFormField
          name="note"
          label={`Nota para ${student.displayName}`}
          hint="La verá junto a la clase nueva."
          serverError={fieldMessage(state, "note")}
        >
          <textarea rows={2} maxLength={300} defaultValue={(state.values?.note as string | undefined) ?? ""} />
        </PlatformFormField>
      )}

      <ul className="reschedule-seat__lines">
        {where === "later" ? (
          <li>Su clase vuelve a su pago y queda por programar: no gasta otra.</li>
        ) : (
          <li>Su clase pasa a la nueva fecha con el mismo pago: no gasta otra.</li>
        )}
        <li>
          La clase del {missedDay} queda en su historial como{" "}
          {where === "later" ? "«Faltó · devuelta a su pago»" : "«Faltó · reprogramada»"}.
        </li>
      </ul>

      <div className="reschedule-seat__foot">
        <SubmitButton
          className="platform-button platform-button_variant_ink"
          pendingLabel={where === "later" ? "Dejando por programar…" : "Reprogramando…"}
        >
          {where === "later" ? "Dejarla por programar" : "Reprogramar"}
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
