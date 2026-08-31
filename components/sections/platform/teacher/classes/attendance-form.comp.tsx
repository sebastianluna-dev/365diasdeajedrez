import { markAttendance, removeParticipant } from "@/services/teacher-classes/teacher-classes.actions";
import type { TeacherClassParticipant } from "@/services/teacher-classes/teacher-classes.types";
import "./attendance-form.comp.css";

interface AttendanceFormProps {
  classId: string;
  participants: TeacherClassParticipant[];
}

/**
 * Asistencia de la clase. Marcar a un alumno registra su actividad (y con ella
 * sus estadísticas) por el único punto de escritura que existe para eso, así
 * que el formulario se envía entero y el servidor decide qué cambió.
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

            {/* Quitar sólo tiene sentido con quien no dejó rastro: el servidor
                rechaza a quien ya asistió o pagó. */}
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
