import { ClassContentRenderer } from "@/components/common/class-content-renderer.comp";
import { EmptyState } from "@/components/common/empty-state.comp";
import { FormField } from "@/components/common/form-field.comp";
import { LocalDateTime } from "@/components/common/local-datetime.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/common/platform-table.comp";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { cancelClassAsStaff, setRecordingUrl } from "@/services/staff-classes/staff-classes.actions";
import type { StaffClassDetail } from "@/services/staff-classes/staff-classes.types";
import "./staff-class-detail.section.css";

interface StaffClassDetailSectionProps {
  classDetail: StaffClassDetail;
  errorCode?: string;
}

export function StaffClassDetailSection({ classDetail, errorCode }: StaffClassDetailSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;
  const isCancelled = classDetail.statusCode === CLASS_STATUS.CANCELLED;

  return (
    <div className="staff-class">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <section className="platform-card">
        <h2 className="platform-card__title">Datos</h2>
        <dl className="staff-class__facts">
          <div className="staff-class__fact">
            <dt className="staff-class__fact-label">Profesor</dt>
            <dd className="staff-class__fact-value">{classDetail.teacherName}</dd>
          </div>
          <div className="staff-class__fact">
            <dt className="staff-class__fact-label">Cuándo</dt>
            <dd className="staff-class__fact-value">
              <LocalDateTime
                iso={classDetail.scheduledAtIso}
                fallback={`${classDetail.dateLabel} · ${classDetail.timeLabel}`}
              />
              {` · ${classDetail.durationMin} min`}
            </dd>
          </div>
          <div className="staff-class__fact">
            <dt className="staff-class__fact-label">Estado</dt>
            <dd className="staff-class__fact-value">
              <span className="platform-tag">{classDetail.statusLabel}</span>
            </dd>
          </div>
          {classDetail.meetingProviderLabel && (
            <div className="staff-class__fact">
              <dt className="staff-class__fact-label">Reunión</dt>
              <dd className="staff-class__fact-value">{classDetail.meetingProviderLabel}</dd>
            </div>
          )}
        </dl>

        {classDetail.summary && <p className="staff-class__summary">{classDetail.summary}</p>}
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Soporte</h2>
        <p className="staff-class__note">
          Estas son las dos únicas acciones del equipo de administración sobre una clase. El contenido, la asistencia y
          los datos los gestiona el profesor.
        </p>

        <form className="staff-class__support" action={setRecordingUrl.bind(null, classDetail.id)}>
          <FormField label="Grabación (URL)">
            <input type="url" name="recordingUrl" defaultValue={classDetail.recordingUrl ?? ""} maxLength={500} />
          </FormField>
          <button type="submit" className="platform-button platform-button_variant_secondary">
            Guardar grabación
          </button>
        </form>

        {!isCancelled && (
          <form className="staff-class__support" action={cancelClassAsStaff.bind(null, classDetail.id)}>
            <FormField label="Cancelar la clase — motivo" hint="Queda anotado en el resumen con marca de soporte.">
              <input type="text" name="note" maxLength={300} required />
            </FormField>
            <button type="submit" className="platform-button platform-button_variant_secondary">
              Cancelar clase
            </button>
          </form>
        )}
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Alumnos</h2>
        <PlatformTable
          columns={["Alumno", "Email", "Asistió", "Pago", "Importe", "Referencia"]}
          emptyLabel="Esta clase no tiene alumnos inscritos."
          minWidth={860}
        >
          {classDetail.participants.map((participant) => (
            <PlatformTableRow key={participant.userId}>
              <PlatformTableCell strong>{participant.displayName}</PlatformTableCell>
              <PlatformTableCell>{participant.email}</PlatformTableCell>
              <PlatformTableCell>{participant.attended ? "Sí" : "No"}</PlatformTableCell>
              <PlatformTableCell>{participant.paidAtLabel ?? "—"}</PlatformTableCell>
              <PlatformTableCell>{participant.amountLabel ?? "—"}</PlatformTableCell>
              <PlatformTableCell>{participant.paymentRef ?? "—"}</PlatformTableCell>
            </PlatformTableRow>
          ))}
        </PlatformTable>
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Contenido</h2>
        {classDetail.blocks.length > 0 ? (
          <ClassContentRenderer blocks={classDetail.blocks} />
        ) : (
          <EmptyState title="Esta clase no tiene contenido" />
        )}
      </section>

      {classDetail.transcript && (
        <section className="platform-card">
          <h2 className="platform-card__title">Transcripción</h2>
          <p className="staff-class__note">{classDetail.transcript.statusLabel}</p>
          {classDetail.transcript.text && <p className="staff-class__summary">{classDetail.transcript.text}</p>}
        </section>
      )}
    </div>
  );
}
