import { markAttendance, removeParticipant } from "@/services/teacher-classes/teacher-classes.actions";
import type { TeacherClassParticipant } from "@/services/teacher-classes/teacher-classes.types";
import "./attendance-form.comp.css";

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
            <label className="attendance-form__check">
              <input type="checkbox" name="attended" value={participant.userId} defaultChecked={participant.attended} />
              <span className="attendance-form__name">{participant.displayName}</span>
            </label>

            <span className="attendance-form__meta">
              {participant.hasPayment ? "Pago registrado" : "Sin pago registrado"}
            </span>

            {/* Removing only makes sense for someone who left no trace: the server
                rejects whoever already attended or paid. */}
            {!participant.attended && !participant.hasPayment && (
              <button
                type="submit"
                formAction={removeParticipant.bind(null, classId)}
                name="studentId"
                value={participant.userId}
                className="attendance-form__remove"
              >
                Quitar
              </button>
            )}
          </li>
        ))}
      </ul>

      <button type="submit" className="platform-button">
        Guardar asistencia
      </button>
    </form>
  );
}
