import Link from "next/link";
import { FormField } from "@/components/platform/shared/form-field.comp";
import { LocalDateTime } from "@/components/platform/shared/local-datetime.comp";
import { staffRoutes } from "@/lib/platform-routes";
import { assignStudent, endAssignment } from "@/services/staff-teachers/staff-teachers.actions";
import type { StudentAssignmentHistoryItem } from "@/services/staff-students/staff-students.types";
import type { AssignableStudent, TeacherStudentAssignment } from "@/services/staff-teachers/staff-teachers.types";
import "./assignment-panel.comp.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";

interface ByStudentProps {
  mode: "byStudent";
  studentId: string;
  /** Full history: the active one is the one with a null endedAt. */
  assignments: StudentAssignmentHistoryItem[];
  teachers: { id: string; displayName: string }[];
}

interface ByTeacherProps {
  mode: "byTeacher";
  teacherId: string;
  students: TeacherStudentAssignment[];
  assignable: AssignableStudent[];
}

type AssignmentPanelProps = ByStudentProps | ByTeacherProps;

/**
 * Student↔teacher assignment panel, shared by both detail pages: it is the
 * same operation seen from each side, so it shares services and actions.
 * Reassigning closes the active row and creates another — the history is never deleted.
 */
export function AssignmentPanel(props: AssignmentPanelProps) {
  if (props.mode === "byStudent") {
    const active = props.assignments.find((assignment) => assignment.isActive);
    const history = props.assignments.filter((assignment) => !assignment.isActive);
    const returnTo = staffRoutes.studentDetail(props.studentId);

    return (
      <div className="assignment-panel">
        <p className="assignment-panel__current">
          {active ? (
            <>
              Profesor actual: <strong>{active.teacherName}</strong> desde{" "}
              <LocalDateTime iso={active.assignedAtIso} fallback={active.assignedAtLabel} withTime={false} />
            </>
          ) : (
            "Este alumno no tiene profesor asignado."
          )}
        </p>

        <form className="assignment-panel__form" action={assignStudent}>
          <input type="hidden" name="studentId" value={props.studentId} />
          <input type="hidden" name="returnTo" value={returnTo} />

          <FormField label={active ? "Reasignar a" : "Asignar a"}>
            <PlatformSelect
              name="teacherId"
              required
              placeholder="Elige un profesor…"
              options={props.teachers.map((teacher) => ({ value: teacher.id, label: teacher.displayName }))}
              size="compact"
            />
          </FormField>

          <FormField label="Nota (opcional)">
            <input type="text" name="note" maxLength={300} />
          </FormField>

          <SubmitButton pendingLabel="Asignando…">{active ? "Reasignar" : "Asignar"}</SubmitButton>
        </form>

        {active && (
          <form action={endAssignment.bind(null, active.id)}>
            <input type="hidden" name="returnTo" value={returnTo} />
            <SubmitButton className="platform-button platform-button_variant_secondary" pendingLabel="Terminando…">
              Terminar la asignación actual
            </SubmitButton>
          </form>
        )}

        {history.length > 0 && (
          <div className="assignment-panel__history">
            <h3 className="assignment-panel__history-title">Historial</h3>
            <ul className="assignment-panel__history-list">
              {history.map((assignment) => (
                <li key={assignment.id} className="assignment-panel__history-item">
                  <span className="assignment-panel__history-teacher">{assignment.teacherName}</span>
                  <span className="assignment-panel__history-dates">
                    {assignment.assignedAtLabel} → {assignment.endedAtLabel ?? "—"}
                  </span>
                  {assignment.assignedByName && (
                    <span className="assignment-panel__history-meta">Asignó: {assignment.assignedByName}</span>
                  )}
                  {assignment.note && <span className="assignment-panel__history-meta">{assignment.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const returnTo = staffRoutes.teacherDetail(props.teacherId);

  return (
    <div className="assignment-panel">
      {props.students.length > 0 ? (
        <ul className="assignment-panel__students">
          {props.students.map((assignment) => (
            <li key={assignment.assignmentId} className="assignment-panel__student">
              <Link href={assignment.studentHref} className="assignment-panel__student-name">
                {assignment.studentName}
              </Link>
              <span className="assignment-panel__history-meta">desde {assignment.assignedAtLabel}</span>

              <form action={endAssignment.bind(null, assignment.assignmentId)}>
                <input type="hidden" name="returnTo" value={returnTo} />
                <SubmitButton className="assignment-panel__end" pendingLabel="Terminando…">
                  Terminar
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="assignment-panel__current">Este profesor no tiene alumnos asignados.</p>
      )}

      <form className="assignment-panel__form" action={assignStudent}>
        <input type="hidden" name="teacherId" value={props.teacherId} />
        <input type="hidden" name="returnTo" value={returnTo} />

        <FormField label="Agregar alumno" hint="Si el alumno ya tiene profesor, asignarlo aquí lo reasigna.">
          <PlatformSelect
            name="studentId"
            required
            placeholder="Elige un alumno…"
            options={props.assignable.map((student) => ({
              value: student.id,
              label: `${student.displayName}${student.currentTeacherName ? ` — ahora con ${student.currentTeacherName}` : ""}`,
            }))}
            size="compact"
          />
        </FormField>

        <FormField label="Nota (opcional)">
          <input type="text" name="note" maxLength={300} />
        </FormField>

        <SubmitButton pendingLabel="Asignando…">Asignar</SubmitButton>
      </form>
    </div>
  );
}
