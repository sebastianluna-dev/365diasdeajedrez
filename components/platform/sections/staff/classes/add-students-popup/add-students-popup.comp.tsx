"use client";

import { useActionState, useEffect, useImperativeHandle, useRef, useState, useTransition, type Ref } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircleInfoIcon } from "@/components/icons/circle-info-icon.comp";
import { UserPlusIcon } from "@/components/icons/user-plus-icon.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import { PlatformForm, PlatformFormGroup } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { PlatformSearchField } from "@/components/platform/shared/platform-search-field/platform-search-field.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { CLASS_FIELD_ERRORS } from "@/constants/platform/class-messages.const";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import type { SchedulableStudent } from "@/services/staff-classes/staff-classes.types";
import "./add-students-popup.comp.css";

export interface AddStudentsPopupHandle {
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
}

export interface AddStudentsPopupProps {
  classId: string;
  classTitle: string;
  /** Seats still free; an individual class has one when empty. */
  seatsFree: number;
  /** Who is already in the class: their cards are greyed. */
  seatedIds: string[];
  students: SchedulableStudent[];
  teacher: { id: string; displayName: string };
  addClassParticipants: (classId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  ref?: Ref<AddStudentsPopupHandle>;
}

type Coverage = "auto" | "unpaid" | "free";
const SEARCH_FROM = 8;

function fieldMessage(state: PopupFormState, field: string): string | undefined {
  const error = state.fieldErrors?.[field];
  if (!error) return undefined;
  if (error.code === "tooManyStudents" && error.args) {
    return `Elegiste ${error.args.chosen} alumnos y la clase tiene ${error.args.capacity} plazas.`;
  }
  return CLASS_FIELD_ERRORS[error.code] ?? error.code;
}

function description(student: SchedulableStudent, seated: boolean): string {
  if (seated) return "Ya está en la clase";
  if (student.toSchedule > 0) return `Usará una clase de su ${student.oldestPaymentLabel}`;
  return student.hasPayments ? "Sin clases por programar" : "Sin clases pagadas";
}

/**
 * «Agregar alumnos» (ADM-4): the students as cards, the ones already in
 * the class greyed, and under them how each chosen one enters (D6): with
 * their payment, with the payment pending, or free. A student not assigned
 * to the class's teacher is said, not refused.
 */
export function AddStudentsPopup({ ref, ...props }: AddStudentsPopupProps) {
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
    <PlatformPopup ref={popup} title="Agregar alumnos" size="md" phone="sheet" onClose={() => setUse((n) => n + 1)}>
      <AddStudentsForm
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

/** The head's «Agregar alumnos», with the popup behind it. */
export function AddStudentsButton({
  accent = true,
  ...props
}: Omit<AddStudentsPopupProps, "ref"> & { accent?: boolean }) {
  const popup = useRef<AddStudentsPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className={accent ? "platform-button platform-button_variant_accent" : "platform-button"}
        onClick={(event) => popup.current?.open(event)}
      >
        <UserPlusIcon variant="classic-solid" className="platform-button__icon" />
        Agregar alumnos
      </button>
      <AddStudentsPopup ref={popup} {...props} />
    </>
  );
}

interface AddStudentsFormProps extends Omit<AddStudentsPopupProps, "ref"> {
  onDone: (notice: NonNullable<PopupFormState["notice"]>) => void;
}

function AddStudentsForm({
  classId,
  classTitle,
  seatsFree,
  seatedIds,
  students,
  teacher,
  addClassParticipants,
  onDone,
}: AddStudentsFormProps) {
  const [state, formAction] = useActionState(addClassParticipants.bind(null, classId), POPUP_FORM_IDLE);
  const [pending, startSubmit] = useTransition();
  const values = state.values ?? {};
  const [chosen, setChosen] = useState<string[]>(
    Array.isArray(values.students)
      ? (values.students as string[])
      : typeof values.students === "string"
        ? [values.students]
        : [],
  );
  const [coverages, setCoverages] = useState<Record<string, Coverage>>(() =>
    Object.fromEntries(
      Object.entries(values)
        .filter(([name, value]) => name.startsWith("coverage.") && typeof value === "string")
        .map(([name, value]) => [name.slice("coverage.".length), value as Coverage]),
    ),
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);

  const seated = new Set(seatedIds);
  const byId = new Map(students.map((student) => [student.id, student]));
  const picked = chosen.map((id) => byId.get(id)).filter((s): s is SchedulableStudent => s !== undefined);
  const coverageOf = (student: SchedulableStudent): Coverage =>
    coverages[student.id] ?? (student.toSchedule > 0 ? "auto" : "unpaid");
  const hidden = search.trim()
    ? students.filter((s) => !s.displayName.toLowerCase().includes(search.trim().toLowerCase())).map((s) => s.id)
    : [];
  const formError = state.formError ? (CLASS_FIELD_ERRORS[state.formError.code] ?? state.formError.code) : undefined;

  return (
    // Submitted by hand, so React's reset of the form does not reach the
    // controlled cards (see NewClassForm).
    <PlatformForm
      className="add-students__form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startSubmit(() => formAction(data));
      }}
    >
      <p className="add-students__class">
        {classTitle} ·{" "}
        {seatsFree === 0
          ? "sin plazas libres"
          : `${seatsFree} plaza${seatsFree === 1 ? "" : "s"} libre${seatsFree === 1 ? "" : "s"}`}
        {picked.length > 0 ? ` · ${picked.length} elegido${picked.length === 1 ? "" : "s"}` : ""}
      </p>
      {formError && <PlatformNotice message={formError} />}
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
            meta: !seated.has(student.id) && student.toSchedule > 0 ? `${student.toSchedule} por programar` : undefined,
            description: description(student, seated.has(student.id)),
            disabled: seated.has(student.id),
          }))}
        />
      </PlatformFormGroup>
      {picked.map((student) => (
        <div key={student.id} className="add-students__entry">
          <PlatformFormGroup
            label={`Entra ${student.displayName}`}
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
              options={[
                ...(student.toSchedule > 0 ? [{ value: "auto", label: "Con su pago" }] : []),
                { value: "unpaid", label: "Con el pago pendiente" },
                { value: "free", label: "Gratis" },
              ]}
            />
          </PlatformFormGroup>
          {student.teacherId !== teacher.id && (
            <p className="add-students__warning">
              <CircleInfoIcon variant="classic-light" className="add-students__warning-icon" />
              {student.displayName} no es alumna de {teacher.displayName}: verá su nombre en esta clase, no su ficha.
            </p>
          )}
        </div>
      ))}
      <div className="add-students__foot">
        <SubmitButton
          className="platform-button platform-button_variant_ink"
          pendingLabel="Agregando…"
          pending={pending}
          disabled={seatsFree === 0}
        >
          Agregar alumnos
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
