"use client";

import { useActionState, useEffect, useId, useState, useTransition } from "react";
import { CircleInfoIcon } from "@/components/icons/circle-info-icon.comp";
import {
  ClassSlotFields,
  type ClassSlotValue,
} from "@/components/platform/shared/class-slot-fields/class-slot-fields.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import {
  PlatformForm,
  PlatformFormField,
  PlatformFormGroup,
} from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { PlatformSearchField } from "@/components/platform/shared/platform-search-field/platform-search-field.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { CLASS_FORMAT, type ClassFormatCode } from "@/constants/platform/class-codes.const";
import { CLASS_FIELD_ERRORS } from "@/constants/platform/class-messages.const";
import { formatClassDay, formatClassWhen } from "@/lib/format-class-when";
import { GROUP_CAPACITY_MAX, GROUP_CAPACITY_MIN } from "@/services/shared/class-rules";
import { slotInstant, validateClassSchedule } from "@/services/shared/class-schedule-rules";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { MEETING_VISIBLE_OPTIONS } from "@/services/shared/meeting-visible-from";
import type { NewClassDefaults, SchedulableStudent } from "@/services/staff-classes/staff-classes.types";
import type { BusySlotView, TeacherOption } from "@/services/staff-payments/staff-payments.types";
import "./new-class-form.comp.css";

export interface NewClassFormProps {
  defaults: NewClassDefaults;
  teachers: TeacherOption[];
  students: SchedulableStudent[];
  timeZone: string;
  nowIso: string;
  /** The server actions, as props; stubs in Storybook. */
  createClass: (prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  loadTeacherBusy: (teacherId: string) => Promise<BusySlotView[]>;
}

type Coverage = "auto" | "unpaid" | "free";

/** From how many students the search box appears. */
const SEARCH_FROM = 8;
const CAPACITIES = Array.from({ length: GROUP_CAPACITY_MAX - GROUP_CAPACITY_MIN + 1 }, (_, index) => ({
  value: String(GROUP_CAPACITY_MIN + index),
  label: String(GROUP_CAPACITY_MIN + index),
}));

/** A field's words for the code the server returned. */
function fieldMessage(state: PopupFormState, field: string): string | undefined {
  const error = state.fieldErrors?.[field];
  if (!error) return undefined;
  if (error.code === "tooManyStudents" && error.args) {
    return `Elegiste ${error.args.chosen} alumnos y la clase tiene ${error.args.capacity} plazas.`;
  }
  return CLASS_FIELD_ERRORS[error.code] ?? error.code;
}

/** What a student's card says under their name. */
function studentDescription(student: SchedulableStudent): string {
  if (student.toSchedule > 0) return `Usará una clase de su ${student.oldestPaymentLabel}`;
  return student.hasPayments ? "Sin clases por programar" : "Sin clases pagadas";
}

function coverageOptions(student: SchedulableStudent) {
  return [
    ...(student.toSchedule > 0 ? [{ value: "auto", label: "Con su pago" }] : []),
    { value: "unpaid", label: "Con el pago pendiente" },
    { value: "free", label: "Gratis" },
  ];
}

const defaultCoverage = (student: SchedulableStudent): Coverage => (student.toSchedule > 0 ? "auto" : "unpaid");

/**
 * «Crear clase» (ADM-3): the format, the topic, when, who gives it and how
 * it is joined, the students — each with how they enter (D6) — and the
 * summary that sums it up with the button, sticky beside the fields and,
 * on a phone, a strip at the foot of the form. The fields keep what was
 * typed when the server refuses one.
 */
export function NewClassForm({
  defaults,
  teachers,
  students,
  timeZone,
  nowIso,
  createClass,
  loadTeacherBusy,
}: NewClassFormProps) {
  const [state, formAction] = useActionState(createClass, POPUP_FORM_IDLE);
  const [pending, startSubmit] = useTransition();
  const now = new Date(nowIso);
  const values = state.values ?? {};
  const text = (name: string, fallback = "") =>
    typeof values[name] === "string" ? (values[name] as string) : fallback;

  const [format, setFormat] = useState<ClassFormatCode>(
    text("format", defaults.format === CLASS_FORMAT.GROUP ? "group" : "individual") === "group"
      ? CLASS_FORMAT.GROUP
      : CLASS_FORMAT.INDIVIDUAL,
  );
  const [title, setTitle] = useState(text("title", defaults.title));
  const [slot, setSlot] = useState<Partial<ClassSlotValue>>({
    date: text("date", defaults.date),
    time: text("time", defaults.time),
    durationMin: Number(text("duration", String(defaults.durationMin))) || defaults.durationMin,
  });
  const [teacherId, setTeacherId] = useState(text("teacherId", defaults.teacherId ?? ""));
  const [capacity, setCapacity] = useState(Number(text("capacity", String(defaults.capacity ?? 6))) || 6);
  const initialStudents = Array.isArray(values.students)
    ? (values.students as string[])
    : typeof values.students === "string"
      ? [values.students]
      : [];
  const [chosen, setChosen] = useState<string[]>(initialStudents);
  const [studentId, setStudentId] = useState(text("studentId", defaults.studentId ?? ""));
  const [coverages, setCoverages] = useState<Record<string, Coverage>>(() =>
    Object.fromEntries(
      Object.entries(values)
        .filter(([name, value]) => name.startsWith("coverage.") && typeof value === "string")
        .map(([name, value]) => [name.slice("coverage.".length), value as Coverage]),
    ),
  );
  const [search, setSearch] = useState("");
  const [teacherBusy, setTeacherBusy] = useState<{ teacherId: string; busy: BusySlotView[] } | null>(null);
  const counterId = useId();

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

  const isGroup = format === CLASS_FORMAT.GROUP;
  const byId = new Map(students.map((student) => [student.id, student]));
  const teacherName = teachers.find((teacher) => teacher.id === teacherId)?.displayName ?? null;
  const seated = (isGroup ? chosen : studentId ? [studentId] : [])
    .map((id) => byId.get(id))
    .filter((student): student is SchedulableStudent => student !== undefined);
  const coverageOf = (student: SchedulableStudent): Coverage => coverages[student.id] ?? defaultCoverage(student);

  const start = slot.date && slot.time ? slotInstant(slot.date, slot.time, timeZone) : null;
  const whenLine =
    start && slot.durationMin
      ? formatClassWhen({ start, durationMin: slot.durationMin, timeZone, now, withZone: true })
      : null;
  const warnings =
    start && slot.durationMin
      ? validateClassSchedule({
          scheduledAt: start,
          durationMin: slot.durationMin,
          meetingVisibleFrom: null,
          now,
          teacherBusy: (teacherBusy?.teacherId === teacherId ? teacherBusy.busy : []).map((item) => ({
            title: item.title,
            start: new Date(item.startIso),
            end: new Date(item.endIso),
          })),
          studentBusy: [],
        }).warnings.map((warning) =>
          warning.kind === "teacherOverlap"
            ? `${teacherName ?? "El profesor"} ya tiene «${warning.classTitle}» a esa hora el ${formatClassDay(start, timeZone, now)}.`
            : warning.kind === "studentOverlap"
              ? `${warning.studentName} ya tiene «${warning.classTitle}» a esa hora.`
              : "Esa fecha ya pasó.",
        )
      : [];

  const paid = seated.filter((student) => coverageOf(student) === "auto").length;
  const unpaid = seated.filter((student) => coverageOf(student) === "unpaid").length;
  const free = seated.filter((student) => coverageOf(student) === "free").length;
  const seatsLine = isGroup
    ? [
        `${seated.length} de ${capacity} plazas`,
        `${paid} con pago`,
        `${unpaid} sin pago`,
        ...(free > 0 ? [`${free} gratis`] : []),
      ].join(" · ")
    : seated.length === 0
      ? "Sin alumno"
      : null;
  const formError = state.formError ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code) : undefined;
  const hidden = search.trim()
    ? students
        .filter((student) => !student.displayName.toLowerCase().includes(search.trim().toLowerCase()))
        .map((s) => s.id)
    : [];

  const coverageRow = (student: SchedulableStudent) => (
    <div key={student.id} className="new-class-form__entry">
      <PlatformFormGroup
        label={isGroup ? `Entra ${student.displayName}` : "Entra"}
        serverError={fieldMessage(state, `coverage.${student.id}`)}
        hint={
          coverageOf(student) === "auto"
            ? undefined
            : "Queda en «Sin pago» hasta que registres su pago. «Gratis» no se cobra ni sale en los pendientes."
        }
      >
        <PlatformChoiceCards
          name={`coverage.${student.id}`}
          layout="line"
          value={coverageOf(student)}
          onValueChange={(value) => setCoverages((current) => ({ ...current, [student.id]: value as Coverage }))}
          options={coverageOptions(student)}
        />
      </PlatformFormGroup>
      {student.teacherId && teacherId && student.teacherId !== teacherId && (
        <p className="new-class-form__warning">
          <CircleInfoIcon variant="classic-light" className="new-class-form__warning-icon" />
          {isGroup
            ? `${student.displayName} no es alumna de ${teacherName ?? "este profesor"}: verá su nombre en esta clase, no su ficha.`
            : `${student.displayName} tiene asignado a otro profesor.`}
        </p>
      )}
      {!student.teacherId && isGroup && teacherName && (
        <p className="new-class-form__warning">
          <CircleInfoIcon variant="classic-light" className="new-class-form__warning-icon" />
          {student.displayName} no es alumna de {teacherName}: verá su nombre en esta clase, no su ficha.
        </p>
      )}
    </div>
  );

  return (
    // Submitted by hand: a `<form action>` is reset by React when the action
    // settles, and the reset reaches Radix's controlled cards and selects,
    // which answer it by changing their value (a ticked student would go).
    <PlatformForm
      className="new-class-form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startSubmit(() => formAction(data));
      }}
    >
      <div className="new-class-form__fields">
        {formError && <PlatformNotice message={formError} />}

        <section className="new-class-form__section" aria-labelledby={`${counterId}-format`}>
          <h2 id={`${counterId}-format`} className="new-class-form__heading">
            Formato
          </h2>
          <PlatformFormGroup label="Formato" serverError={fieldMessage(state, "format")}>
            <PlatformChoiceCards
              name="format"
              layout="line"
              value={isGroup ? "group" : "individual"}
              onValueChange={(value) => setFormat(value === "group" ? CLASS_FORMAT.GROUP : CLASS_FORMAT.INDIVIDUAL)}
              options={[
                { value: "individual", label: "Individual", description: "Un alumno." },
                { value: "group", label: "Grupal", description: "Varios alumnos; cada uno usa una clase de su pago." },
              ]}
            />
          </PlatformFormGroup>
        </section>

        <section className="new-class-form__section" aria-labelledby={`${counterId}-topic`}>
          <h2 id={`${counterId}-topic`} className="new-class-form__heading">
            Tema
          </h2>
          <PlatformFormField
            name="title"
            label="Título"
            hint="Lo ven los alumnos. El profesor puede cambiarlo."
            serverError={fieldMessage(state, "title")}
          >
            <input
              type="text"
              maxLength={200}
              required={isGroup}
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
            />
          </PlatformFormField>
          <PlatformFormField name="description" label="Descripción" serverError={fieldMessage(state, "description")}>
            <textarea rows={3} maxLength={2000} defaultValue={text("description", defaults.description)} />
          </PlatformFormField>
        </section>

        <section className="new-class-form__section" aria-labelledby={`${counterId}-when`}>
          <h2 id={`${counterId}-when`} className="new-class-form__heading">
            Cuándo
          </h2>
          <ClassSlotFields
            namePrefix=""
            defaultValue={slot}
            timeZone={timeZone}
            onChange={setSlot}
            warnings={warnings}
            serverError={fieldMessage(state, "date")}
          />
          <p className="new-class-form__when" aria-live="polite">
            {whenLine ?? "Elige el día y la hora."}
          </p>
        </section>

        <section className="new-class-form__section" aria-labelledby={`${counterId}-teacher`}>
          <h2 id={`${counterId}-teacher`} className="new-class-form__heading">
            Profesor y reunión
          </h2>
          <PlatformFormField name="teacherId" label="Profesor" serverError={fieldMessage(state, "teacherId")}>
            <PlatformSelect
              options={teachers.map((teacher) => ({ value: teacher.id, label: teacher.displayName }))}
              value={teacherId}
              onValueChange={setTeacherId}
              placeholder="Elige un profesor"
              required
            />
          </PlatformFormField>
          <PlatformFormField
            name="meetingUrl"
            label="Enlace de la reunión"
            hint="Zoom o Meet: la plataforma se reconoce por el enlace."
            serverError={fieldMessage(state, "meetingUrl")}
          >
            <input
              type="url"
              maxLength={2000}
              defaultValue={text("meetingUrl", defaults.meetingUrl)}
              placeholder="https://zoom.us/j/…"
            />
          </PlatformFormField>
          <PlatformFormField
            name="visibleFrom"
            label="Los alumnos ven el enlace"
            serverError={fieldMessage(state, "visibleFrom")}
          >
            <PlatformSelect options={[...MEETING_VISIBLE_OPTIONS]} defaultValue={text("visibleFrom", "30")} required />
          </PlatformFormField>
        </section>

        <section className="new-class-form__section" aria-labelledby={`${counterId}-students`}>
          <div className="new-class-form__students-head">
            <h2 id={`${counterId}-students`} className="new-class-form__heading">
              {isGroup ? "Alumnos" : "Alumno"}
            </h2>
            {isGroup && (
              <p className="new-class-form__counter" aria-live="polite">
                {seated.length} de {capacity} plazas
              </p>
            )}
          </div>
          {isGroup ? (
            <>
              <PlatformFormField name="capacity" label="Plazas" serverError={fieldMessage(state, "capacity")}>
                <PlatformSelect
                  options={CAPACITIES}
                  value={String(capacity)}
                  onValueChange={(value) => setCapacity(Number(value))}
                  required
                />
              </PlatformFormField>
              {students.length >= SEARCH_FROM && (
                <PlatformSearchField label="Buscar alumno" placeholder="Buscar alumno" onValueChange={setSearch} />
              )}
              <PlatformFormGroup label="Alumnos" serverError={fieldMessage(state, "students")}>
                <PlatformCheckCards
                  name="students"
                  value={chosen}
                  onValueChange={setChosen}
                  hiddenValues={hidden}
                  options={students.map((student) => ({
                    value: student.id,
                    label: student.displayName,
                    meta: student.toSchedule > 0 ? `${student.toSchedule} por programar` : undefined,
                    description: studentDescription(student),
                  }))}
                />
              </PlatformFormGroup>
              {seated.map(coverageRow)}
            </>
          ) : (
            <>
              <PlatformFormField name="studentId" label="Alumno" serverError={fieldMessage(state, "studentId")}>
                <PlatformSelect
                  options={students.map((student) => ({
                    value: student.id,
                    label: `${student.displayName} · ${studentDescription(student)}`,
                  }))}
                  value={studentId}
                  onValueChange={setStudentId}
                  placeholder="Elige un alumno"
                  required
                />
              </PlatformFormField>
              {seated.map(coverageRow)}
            </>
          )}
        </section>
      </div>

      <aside className="new-class-form__summary" aria-label="Resumen">
        <h2 className="new-class-form__heading">Resumen</h2>
        <dl className="new-class-form__facts">
          <div className="new-class-form__fact">
            <dt>Formato</dt>
            <dd>{isGroup ? "Grupal" : "Individual"}</dd>
          </div>
          <div className="new-class-form__fact">
            <dt>Tema</dt>
            <dd>
              {title.trim() || (isGroup ? "Sin tema" : seated[0] ? `Clase de ${seated[0].displayName}` : "Sin tema")}
            </dd>
          </div>
          <div className="new-class-form__fact">
            <dt>Cuándo</dt>
            <dd>{whenLine ?? "—"}</dd>
          </div>
          <div className="new-class-form__fact">
            <dt>Profesor</dt>
            <dd>{teacherName ?? "—"}</dd>
          </div>
          {seatsLine && (
            <div className="new-class-form__fact">
              <dt>Plazas</dt>
              <dd>{seatsLine}</dd>
            </div>
          )}
        </dl>
        {seated.length > 0 && (
          <ul className="new-class-form__seats">
            {seated.map((student) => {
              const coverage = coverageOf(student);
              return (
                <li key={student.id} className="new-class-form__seat">
                  {student.displayName} —{" "}
                  {coverage === "auto" ? student.oldestPaymentLabel : coverage === "free" ? "gratis" : "sin pago"}
                </li>
              );
            })}
          </ul>
        )}
        <div className="new-class-form__submit">
          <SubmitButton
            className="platform-button platform-button_variant_accent platform-button_size_lg"
            pendingLabel="Creando…"
            pending={pending}
          >
            Crear clase
          </SubmitButton>
        </div>
      </aside>
    </PlatformForm>
  );
}
