"use client";

import {
  useActionState,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  useTransition,
  type Ref,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ReceiptIcon } from "@/components/icons/receipt-icon.comp";
import {
  ClassSlotFields,
  type ClassSlotValue,
} from "@/components/platform/shared/class-slot-fields/class-slot-fields.comp";
import { PlatformActionsMenu } from "@/components/platform/shared/platform-actions-menu/platform-actions-menu.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import { PlatformDatePicker } from "@/components/platform/shared/platform-date-picker/platform-date-picker.comp";
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
import { CURRENCY, type CurrencyCode } from "@/constants/platform/currency-codes.const";
import { formatClassAmount, perClassAmount } from "@/lib/format-class-amount";
import { formatClassDay, formatClassWhen } from "@/lib/format-class-when";
import { dayKeyIn } from "@/lib/timezone";
import { slotInstant, validateClassSchedule, weeklyDates } from "@/services/shared/class-schedule-rules";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { planPaymentSeats } from "@/services/shared/payment-seats";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import type {
  BusySlotView,
  OpenGroupClassOption,
  PaymentContext,
  StaffPaymentView,
  TeacherOption,
} from "@/services/staff-payments/staff-payments.types";
import { savedValueKey } from "../saved-value-key";
import "./register-payment-popup.comp.css";

/** The words of the field the server refused. */
function fieldMessage(state: PopupFormState, field: string): string | undefined {
  const error = state.fieldErrors?.[field];
  if (!error) return undefined;
  const text = CLASS_FIELD_ERRORS[error.code] ?? error.code;
  if (error.code === "tooManySeats" && error.args?.total !== undefined) {
    return `Entre las clases con fecha y las cubiertas hay ${error.args.total}, y el pago es de ${error.args.classCount ?? "menos"}.`;
  }
  if (error.code === "classCountBelowSeats" && error.args?.counting !== undefined) {
    return `Ya hay ${error.args.counting} clases con este pago: no puede pagar menos de ${error.args.counting}.`;
  }
  return text;
}

const CURRENCIES = [
  { value: CURRENCY.MXN, label: "Peso mexicano (MXN)" },
  { value: CURRENCY.USD, label: "Dólar estadounidense (USD)" },
  { value: CURRENCY.EUR, label: "Euro (EUR)" },
];

const COUNTS = ["1", "2", "4", "8"];

/** What the host may open the popup with: a student already chosen, classes to cover, the payment to edit. */
export interface RegisterPaymentPreset {
  studentId?: string;
  cover?: string[];
}

export interface RegisterPaymentPopupHandle {
  open: (event?: { currentTarget: HTMLElement }, preset?: RegisterPaymentPreset) => void;
  close: () => void;
}

export interface RegisterPaymentPopupProps {
  /** The students to choose from, grouped by teacher; left out when the student is fixed. */
  students?: { label: string; options: { value: string; label: string }[] }[];
  /** The student the popup opens on, when it is opened from their record or their row. */
  fixedStudent?: { id: string; displayName: string; email: string };
  /** Edit mode: the payment's own fields, nothing about its classes. */
  payment?: Pick<
    StaffPaymentView,
    "id" | "amount" | "currencyCode" | "paidOnIso" | "classCount" | "reference" | "note" | "minClassCount"
  >;
  teachers: TeacherOption[];
  groupClasses: OpenGroupClassOption[];
  timeZone: string;
  nowIso: string;
  registerPayment: (prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  updatePayment?: (paymentId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  loadPaymentContext: (studentId: string) => Promise<PaymentContext | null>;
  loadTeacherBusy: (teacherId: string) => Promise<BusySlotView[]>;
  ref?: Ref<RegisterPaymentPopupHandle>;
}

/**
 * «Registrar pago» (ADM-2) and, with `payment`, «Editar pago»: the popup
 * with the form. It has no trigger; a host opens it through its `ref`
 * (`RegisterPaymentButton` draws one). The form is remounted on every use
 * (its key moves in `onClose`); on success the host closes it and puts the
 * notice in the address.
 */
export function RegisterPaymentPopup({ ref, ...props }: RegisterPaymentPopupProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  const [use, setUse] = useState(0);
  const [preset, setPreset] = useState<RegisterPaymentPreset>({});
  const router = useRouter();
  const pathname = usePathname();

  useImperativeHandle(
    ref,
    () => ({
      open: (event, next) => {
        setPreset(next ?? {});
        popup.current?.open(event);
      },
      close: () => popup.current?.close(),
    }),
    [],
  );

  return (
    <PlatformPopup
      ref={popup}
      title={props.payment ? "Editar pago" : "Registrar pago"}
      size="lg"
      phone="sheet"
      onClose={() => setUse((count) => count + 1)}
    >
      <RegisterPaymentForm
        key={use}
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

interface RegisterPaymentButtonProps extends Omit<RegisterPaymentPopupProps, "ref"> {
  /** `accent` is a page's main action, with the receipt; `button` a plain one; `row` the word at the end of a queue's row. */
  variant?: "accent" | "button" | "row";
  label?: string;
  preset?: RegisterPaymentPreset;
}

const LAUNCHER_CLASS: Record<NonNullable<RegisterPaymentButtonProps["variant"]>, string> = {
  accent: "platform-button platform-button_variant_accent",
  button: "platform-button",
  row: "platform-row-action",
};

/** A launcher with the popup behind it. */
export function RegisterPaymentButton({
  variant = "button",
  label = "Registrar pago",
  preset,
  ...props
}: RegisterPaymentButtonProps) {
  const popup = useRef<RegisterPaymentPopupHandle>(null);
  return (
    <>
      <button type="button" className={LAUNCHER_CLASS[variant]} onClick={(event) => popup.current?.open(event, preset)}>
        {variant === "accent" && <ReceiptIcon variant="classic-solid" className="platform-button__icon" />}
        {label}
      </button>
      <RegisterPaymentPopup ref={popup} {...props} />
    </>
  );
}

type SlotState =
  { kind: "dated"; value: Partial<ClassSlotValue> } | { kind: "later" } | { kind: "group"; classId: string };

interface RegisterPaymentFormProps extends Omit<RegisterPaymentPopupProps, "ref"> {
  preset: RegisterPaymentPreset;
  onDone: (notice: NonNullable<PopupFormState["notice"]>) => void;
}

function RegisterPaymentForm({
  students,
  fixedStudent,
  payment,
  teachers,
  groupClasses,
  timeZone,
  nowIso,
  registerPayment,
  updatePayment,
  loadPaymentContext,
  loadTeacherBusy,
  preset,
  onDone,
}: RegisterPaymentFormProps) {
  const editing = payment !== undefined;
  const action = editing && updatePayment ? updatePayment.bind(null, payment.id) : registerPayment;
  const [state, formAction] = useActionState(action, POPUP_FORM_IDLE);
  const now = new Date(nowIso);
  const todayKey = dayKeyIn(now, timeZone);
  const values = state.values ?? {};
  const text = (name: string, fallback = "") =>
    typeof values[name] === "string" ? (values[name] as string) : fallback;

  // The student and what the server knows about them.
  const initialStudentId = text("studentId", fixedStudent?.id ?? preset.studentId ?? "");
  const [studentId, setStudentId] = useState(initialStudentId);
  const [context, setContext] = useState<PaymentContext | null>(null);
  const [loading, startLoading] = useTransition();
  useEffect(() => {
    if (!studentId || editing) return;
    let alive = true;
    startLoading(async () => {
      const loaded = await loadPaymentContext(studentId);
      if (alive) setContext(loaded);
    });
    return () => {
      alive = false;
    };
  }, [studentId, editing, loadPaymentContext]);

  // The payment's own fields.
  const [amount, setAmount] = useState(text("amount", payment?.amount ?? ""));
  const [currency, setCurrency] = useState<CurrencyCode>(
    (text("currency", payment?.currencyCode ?? CURRENCY.MXN) as CurrencyCode) ?? CURRENCY.MXN,
  );
  const initialCount = text("classCount", payment ? String(payment.classCount) : "4");
  const [classCount, setClassCount] = useState(initialCount);
  const [countChoice, setCountChoice] = useState(COUNTS.includes(initialCount) ? initialCount : "other");
  const [fillKey, setFillKey] = useState(0);

  // What the payment covers and dates. The rhythm and the teacher come with
  // the context and are only overridden by hand; the rows are derived from
  // the rhythm, each one overridden when it is touched.
  const initialCover = Array.isArray(values.cover)
    ? (values.cover as string[])
    : typeof values.cover === "string"
      ? [values.cover]
      : (preset.cover ?? []);
  const [cover, setCover] = useState<string[]>(initialCover);
  const [when, setWhen] = useState<"now" | "later">(text("when", "now") === "later" ? "later" : "now");
  const [teacherOverride, setTeacherOverride] = useState<string | null>(text("teacherId", "") || null);
  const [rhythmOverride, setRhythmOverride] = useState<Partial<ClassSlotValue> | null>(null);
  const [rowOverrides, setRowOverrides] = useState<Record<number, SlotState>>({});
  const [teacherBusy, setTeacherBusy] = useState<{ teacherId: string; busy: BusySlotView[] } | null>(null);

  const teacherId = teacherOverride ?? context?.rhythm.teacherId ?? "";
  const rhythm = context
    ? {
        firstDate: rhythmOverride?.date ?? context.rhythm.firstDate,
        time: rhythmOverride?.time ?? context.rhythm.time,
        durationMin: rhythmOverride?.durationMin ?? context.rhythm.durationMin,
      }
    : null;

  useEffect(() => {
    if (!teacherId) return;
    let alive = true;
    loadTeacherBusy(teacherId).then((busy) => {
      if (alive) setTeacherBusy({ teacherId, busy });
    });
    return () => {
      alive = false;
    };
  }, [teacherId, loadTeacherBusy]);

  const count = Number(classCount) || 0;
  const toDate = Math.max(0, count - cover.length);
  const rhythmDates = rhythm ? weeklyDates(rhythm.firstDate, toDate) : [];
  const slots: SlotState[] = Array.from({ length: toDate }, (_, index) => {
    const override = rowOverrides[index];
    if (override) return override;
    return rhythm
      ? { kind: "dated", value: { date: rhythmDates[index], time: rhythm.time, durationMin: rhythm.durationMin } }
      : { kind: "dated", value: {} };
  });

  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);

  const formError = state.formError ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code) : undefined;
  const perClass =
    amount && count > 0 && /^\d+(\.\d{1,2})?$/.test(amount)
      ? `${perClassAmount(amount, count, currency)} por clase`
      : null;
  const amountLabel =
    amount && /^\d+(\.\d{1,2})?$/.test(amount) ? formatClassAmount(amount, currency, { withCode: true }) : null;
  const dated = slots.filter((slot) => slot.kind !== "later").length;
  const plan = planPaymentSeats({
    classCount: count,
    covered: cover.length,
    dated: slots.filter((slot) => slot.kind === "dated").length,
    group: slots.filter((slot) => slot.kind === "group").length,
  });
  const studentName = fixedStudent?.displayName ?? context?.student.displayName ?? "";
  const openGroups = groupClasses.filter((cls) => !cls.disabledReason);

  const warningsOf = (slot: SlotState, index: number): string[] => {
    if (slot.kind !== "dated" || !slot.value.date || !slot.value.time || !slot.value.durationMin) return [];
    const start = slotInstant(slot.value.date, slot.value.time, timeZone);
    if (!start) return [];
    const busy = (list: BusySlotView[]) =>
      list.map((item) => ({ title: item.title, start: new Date(item.startIso), end: new Date(item.endIso) }));
    const others = slots.flatMap((other, otherIndex) => {
      if (
        otherIndex === index ||
        other.kind !== "dated" ||
        !other.value.date ||
        !other.value.time ||
        !other.value.durationMin
      )
        return [];
      const otherStart = slotInstant(other.value.date, other.value.time, timeZone);
      return otherStart
        ? [
            {
              title: `la clase ${otherIndex + 1} de este pago`,
              start: otherStart,
              end: new Date(otherStart.getTime() + other.value.durationMin * 60_000),
            },
          ]
        : [];
    });
    const check = validateClassSchedule({
      scheduledAt: start,
      durationMin: slot.value.durationMin,
      meetingVisibleFrom: null,
      now,
      teacherBusy: [
        ...busy(teacherBusy?.teacherId === teacherId ? teacherBusy.busy : (context?.teacherBusy ?? [])),
        ...others,
      ],
      studentBusy: busy(context?.studentBusy ?? []).map((item) => ({ ...item, studentName })),
    });
    const teacherName = teachers.find((teacher) => teacher.id === teacherId)?.displayName ?? "El profesor";
    return check.warnings.map((warning) => {
      const day = formatClassDay(start, timeZone, now);
      if (warning.kind === "teacherOverlap")
        return `${teacherName} ya tiene «${warning.classTitle}» a esa hora el ${day}.`;
      if (warning.kind === "studentOverlap")
        return `${warning.studentName} ya tiene «${warning.classTitle}» a esa hora el ${day}.`;
      return "Esa fecha ya pasó.";
    });
  };

  const footLine = editing
    ? null
    : [
        studentName,
        amountLabel,
        count > 0
          ? `${count} clase${count === 1 ? "" : "s"}${perClass ? ` (${perClass.replace(" por clase", " por clase")})` : ""}`
          : null,
        when === "later"
          ? count > 0
            ? `las ${count} clases quedarán por programar`
            : null
          : plan.ok
            ? `${dated + cover.length} con fecha y ${plan.later} por programar`
            : `${plan.total} con fecha y cubiertas, más de las ${count} que paga`,
      ]
        .filter(Boolean)
        .join(" · ");

  const contextLine = context
    ? [
        context.student.teacherName ? `Profesor: ${context.student.teacherName}` : "Sin profesor asignado",
        context.balanceLine,
        context.lastPayment
          ? `Último pago: ${context.lastPayment.paidOnLabel} · ${context.lastPayment.classCount} clases · ${context.lastPayment.amountLabel}`
          : "Sin pagos registrados",
      ].join(" · ")
    : loading
      ? "Cargando…"
      : null;

  const repeatLast = () => {
    if (!context?.lastPayment) return;
    setAmount(context.lastPayment.amount);
    setCurrency(context.lastPayment.currencyCode);
    setClassCount(String(context.lastPayment.classCount));
    setCountChoice(
      COUNTS.includes(String(context.lastPayment.classCount)) ? String(context.lastPayment.classCount) : "other",
    );
    setFillKey((key) => key + 1);
  };

  const footId = useId();

  return (
    <PlatformForm action={formAction} className="register-payment__form" autoComplete="off">
      <div className="register-payment__body">
        {formError && <PlatformNotice message={formError} />}

        {!editing && (
          <section className="register-payment__section">
            <h3 className="register-payment__heading">Alumno</h3>
            {fixedStudent ? (
              <div className="register-payment__student">
                <span className="register-payment__avatar" aria-hidden="true">
                  {fixedStudent.displayName
                    .split(" ")
                    .slice(0, 2)
                    .map((word) => word.charAt(0))
                    .join("")}
                </span>
                <span className="register-payment__student-text">
                  <span className="register-payment__student-name">{fixedStudent.displayName}</span>
                  <span className="register-payment__student-email">{fixedStudent.email}</span>
                </span>
                <input type="hidden" name="studentId" value={fixedStudent.id} />
              </div>
            ) : (
              <PlatformFormField name="studentId" label="Alumno" serverError={fieldMessage(state, "studentId")}>
                <PlatformSelect
                  groups={students ?? []}
                  defaultValue={initialStudentId || undefined}
                  placeholder="Elige un alumno"
                  required
                  onValueChange={(value) => {
                    setStudentId(value);
                    setContext(null);
                    setRhythmOverride(null);
                    setRowOverrides({});
                  }}
                />
              </PlatformFormField>
            )}
            {contextLine && (
              <p className="register-payment__context" aria-live="polite">
                {contextLine}
                {context?.lastPayment && (
                  <>
                    {" "}
                    <button type="button" className="platform-row-action" onClick={repeatLast}>
                      Repetir ese pago
                    </button>
                  </>
                )}
              </p>
            )}
          </section>
        )}

        <section className="register-payment__section" key={fillKey}>
          <h3 className="register-payment__heading">Pago</h3>
          <div className="register-payment__amount">
            <PlatformFormField
              name="amount"
              label="Importe cobrado"
              hint={perClass ?? undefined}
              serverError={fieldMessage(state, "amount")}
              messages={{ patternMismatch: "Escribe el importe con dos decimales como máximo." }}
            >
              <input
                type="text"
                inputMode="decimal"
                pattern="\d{1,8}(\.\d{1,2})?"
                required
                placeholder="1400.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value.trim())}
              />
            </PlatformFormField>
            <PlatformFormField name="currency" label="Moneda" serverError={fieldMessage(state, "currency")}>
              <PlatformSelect
                options={CURRENCIES}
                defaultValue={currency}
                required
                onValueChange={(value) => setCurrency(value as CurrencyCode)}
              />
            </PlatformFormField>
          </div>
          <PlatformFormField name="paidOn" label="Fecha del pago" serverError={fieldMessage(state, "paidOn")}>
            <PlatformDatePicker
              key={savedValueKey(text("paidOn", payment ? payment.paidOnIso.slice(0, 10) : todayKey))}
              defaultValue={text("paidOn", payment ? payment.paidOnIso.slice(0, 10) : todayKey)}
              required
              max={todayKey}
              placeholder="Elige un día"
            />
          </PlatformFormField>
          <PlatformFormGroup
            label="Clases que paga"
            hint="Las clases pagadas no caducan."
            serverError={fieldMessage(state, "classCount")}
            valueMissing="Elige cuántas clases cubre el pago."
          >
            <div className="register-payment__count">
              <PlatformChoiceCards
                layout="line"
                aria-label="Clases que paga"
                defaultValue={countChoice}
                required
                options={[...COUNTS.map((value) => ({ value, label: value })), { value: "other", label: "Otra" }]}
                onValueChange={(value) => {
                  setCountChoice(value);
                  if (value !== "other") setClassCount(value);
                }}
              />
              {countChoice === "other" ? (
                <input
                  type="number"
                  name="classCount"
                  min={payment?.minClassCount ?? 1}
                  max={50}
                  required
                  value={classCount}
                  aria-label="Cuántas clases"
                  className="register-payment__count-input"
                  onChange={(event) => setClassCount(event.target.value)}
                />
              ) : (
                <input type="hidden" name="classCount" value={classCount} />
              )}
            </div>
          </PlatformFormGroup>
          {editing && payment.minClassCount > 0 && (
            <p className="register-payment__hint">
              Ya hay {payment.minClassCount} clases con este pago: no puede pagar menos de {payment.minClassCount}.
            </p>
          )}
          <PlatformFormField
            name="reference"
            label="Referencia"
            hint="Folio de la transferencia o número de recibo."
            serverError={fieldMessage(state, "reference")}
          >
            <input type="text" maxLength={120} defaultValue={text("reference", payment?.reference ?? "")} />
          </PlatformFormField>
          <PlatformFormField
            name="note"
            label="Nota interna"
            hint="Sólo la ve administración."
            serverError={fieldMessage(state, "note")}
          >
            <textarea rows={2} maxLength={500} defaultValue={text("note", payment?.note ?? "")} />
          </PlatformFormField>
        </section>

        {!editing && context && context.unpaidSeats.length > 0 && (
          <section className="register-payment__section">
            <h3 className="register-payment__heading">Clases sin pago que cubre</h3>
            <PlatformFormGroup label="Clases sin pago" optional serverError={fieldMessage(state, "cover")}>
              <PlatformCheckCards
                name="cover"
                layout="line"
                defaultValue={initialCover}
                onValueChange={setCover}
                options={context.unpaidSeats.map((seat) => ({
                  value: seat.classId,
                  label: seat.title,
                  meta: formatClassWhen({
                    start: new Date(seat.startIso),
                    durationMin: seat.durationMin,
                    timeZone,
                    now,
                  }),
                }))}
              />
            </PlatformFormGroup>
          </section>
        )}

        {!editing && (
          <section className="register-payment__section">
            <h3 className="register-payment__heading">Clases de este pago</h3>
            <PlatformFormGroup label="¿Cuándo serán?">
              <PlatformChoiceCards
                name="when"
                defaultValue={when}
                onValueChange={(value) => setWhen(value === "later" ? "later" : "now")}
                options={[
                  {
                    value: "now",
                    label: "Programarlas ahora",
                    description: "Con su día y su hora. El alumno y el profesor las ven al registrar el pago.",
                  },
                  {
                    value: "later",
                    label: "Dejarlas por programar",
                    description: "Quedan en «Por programar» y les pones fecha después.",
                  },
                ]}
              />
            </PlatformFormGroup>

            {when === "now" && toDate > 0 && (
              <>
                <div className="register-payment__rhythm">
                  <PlatformFormField
                    name="rhythmTeacher"
                    label="Profesor"
                    serverError={fieldMessage(state, "teacherId")}
                  >
                    <PlatformSelect
                      options={teachers.map((teacher) => ({ value: teacher.id, label: teacher.displayName }))}
                      defaultValue={teacherId || undefined}
                      placeholder="Elige un profesor"
                      required
                      onValueChange={setTeacherOverride}
                    />
                  </PlatformFormField>
                  {rhythm && (
                    <ClassSlotFields
                      namePrefix="rhythm"
                      required={false}
                      defaultValue={{ date: rhythm.firstDate, time: rhythm.time, durationMin: rhythm.durationMin }}
                      timeZone={timeZone}
                      onChange={(value) => {
                        setRhythmOverride((current) => ({ ...current, ...value }));
                        setRowOverrides({});
                      }}
                    />
                  )}
                  <p className="register-payment__hint">Repetir: cada semana.</p>
                </div>

                <ol className="register-payment__slots">
                  {slots.map((slot, index) => (
                    <li key={index} className="register-payment__slot">
                      <div className="register-payment__slot-head">
                        <span className="register-payment__slot-name">
                          Clase {cover.length + index + 1} de {count}
                        </span>
                        <PlatformActionsMenu
                          label={`Acciones de la clase ${cover.length + index + 1}`}
                          items={[
                            ...(slot.kind !== "dated"
                              ? [
                                  {
                                    label: "Programar",
                                    onSelect: () => setRow(index, { kind: "dated", value: rhythmSlot(rhythm, index) }),
                                  },
                                ]
                              : []),
                            ...(slot.kind !== "later"
                              ? [{ label: "Dejar por programar", onSelect: () => setRow(index, { kind: "later" }) }]
                              : []),
                            ...(openGroups.length > 0 && slot.kind !== "group"
                              ? [
                                  {
                                    label: "Llevar a una clase grupal",
                                    onSelect: () => setRow(index, { kind: "group", classId: openGroups[0]!.classId }),
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </div>
                      <input type="hidden" name={`slot.${index}.kind`} value={slot.kind} />
                      {slot.kind === "dated" && (
                        <>
                          <input type="hidden" name={`slot.${index}.teacherId`} value={teacherId} />
                          <ClassSlotFields
                            namePrefix={`slot.${index}`}
                            defaultValue={slot.value}
                            timeZone={timeZone}
                            warnings={warningsOf(slot, index)}
                            serverError={fieldMessage(state, `slot.${index}`)}
                            onChange={(value) => setRow(index, { kind: "dated", value: { ...slot.value, ...value } })}
                          />
                        </>
                      )}
                      {slot.kind === "later" && <p className="register-payment__slot-later">Por programar</p>}
                      {slot.kind === "group" && (
                        <PlatformFormField
                          name={`slot.${index}.classId`}
                          label="Clase grupal"
                          serverError={fieldMessage(state, `slot.${index}`)}
                        >
                          <PlatformSelect
                            options={openGroups.map((cls) => ({
                              value: cls.classId,
                              label: `${cls.title} · ${formatClassWhen({ start: new Date(cls.startIso), durationMin: cls.durationMin, timeZone, now })}`,
                            }))}
                            defaultValue={slot.classId}
                            required
                            onValueChange={(classId) => setRow(index, { kind: "group", classId })}
                          />
                        </PlatformFormField>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}

            {when === "later" && count > 0 && (
              <p className="register-payment__hint">Las {count} clases quedarán por programar.</p>
            )}

            <PlatformFormField
              name="meetingUrl"
              label="Enlace de la reunión"
              hint="Se usa en las clases de este pago. Los alumnos lo ven 30 minutos antes de empezar."
              serverError={fieldMessage(state, "meetingUrl")}
            >
              <input type="url" maxLength={2000} defaultValue={text("meetingUrl", context?.lastMeetingUrl ?? "")} />
            </PlatformFormField>
          </section>
        )}
      </div>

      <div className="register-payment__foot">
        {footLine && (
          <p id={footId} className="register-payment__foot-line" aria-live="polite">
            {footLine}
          </p>
        )}
        <SubmitButton
          className="platform-button platform-button_variant_ink"
          pendingLabel={editing ? "Guardando…" : "Registrando…"}
        >
          {editing ? "Guardar pago" : "Registrar pago"}
        </SubmitButton>
      </div>
    </PlatformForm>
  );

  function setRow(index: number, next: SlotState) {
    setRowOverrides((current) => ({ ...current, [index]: next }));
  }
}

/** The date a row gets back from the rhythm when it is dated again. */
function rhythmSlot(
  rhythm: { firstDate: string; time: string; durationMin: number } | null,
  index: number,
): Partial<ClassSlotValue> {
  if (!rhythm) return {};
  return { date: weeklyDates(rhythm.firstDate, index + 1)[index], time: rhythm.time, durationMin: rhythm.durationMin };
}
