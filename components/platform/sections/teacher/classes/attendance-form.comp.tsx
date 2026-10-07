import { markAttendance, removeParticipant } from "@/services/teacher-classes/teacher-classes.actions";
import type { TeacherClassParticipant } from "@/services/teacher-classes/teacher-classes.types";
import "./attendance-form.comp.css";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { PlatformCheckbox } from "@/components/platform/shared/platform-checkbox/platform-checkbox.comp";

interface AttendanceFormProps {
  classId: string;
  participants: TeacherClassParticipant[];
}

/**
 * Class attendance. Marking a student records their activity (and with it
 * their statistics) through the only write point that exists for that, so
 * the form is submitted whole and the server decides what changed.
 */
export function AttendanceForm({ classId, participants }: AttendanceFormProps) {
  if (participants.length === 0) {
    return <p className="attendance-form__empty">Inscribe alumnos para poder marcar la asistencia.</p>;
  }

  return (
    <form className="attendance-form" action={markAttendance.bind(null, classId)}>
      <ul className="attendance-form__list">
        {participants.map((participant) => (
          <li key={participant.userId} className="attendance-form__item">
            <PlatformCheckbox
              name="attended"
              value={participant.userId}
              defaultChecked={participant.attended}
              label={participant.displayName}
              className="attendance-form__check"
            />

            <span className="attendance-form__meta">
              {participant.hasPayment ? "Pago registrado" : "Sin pago registrado"}
            </span>

            {/* Removing only makes sense for someone who left no trace: the server
                rejects whoever already attended or paid. The student is bound to
                the action and not sent as the button's `name`: a button with an
                action of its own is left out of the form's data by React, so a
                name on it never reached the server and «Quitar» always failed. */}
            {!participant.attended && !participant.hasPayment && (
              <SubmitButton
                formAction={removeParticipant.bind(null, classId, participant.userId)}
                className="platform-row-action platform-row-action_variant_danger"
                pendingLabel="Quitar"
              >
                Quitar
              </SubmitButton>
            )}
          </li>
        ))}
      </ul>

      <SubmitButton>Guardar asistencia</SubmitButton>
    </form>
  );
}
