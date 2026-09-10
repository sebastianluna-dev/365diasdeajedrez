import Link from "next/link";
import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { LocalDateTime } from "@/components/platform/shared/local-datetime.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import { getTeacherDashboard } from "@/services/teacher/teacher.service";
import type { TeacherClassBrief } from "@/services/teacher/teacher.types";
import "./teacher-dashboard.section.css";

function ClassRow({ item }: { item: TeacherClassBrief }) {
  return (
    <li className="teacher-dashboard__class">
      <Link href={item.href} className="teacher-dashboard__class-title">
        {item.title}
      </Link>
      <span className="teacher-dashboard__class-meta">
        <LocalDateTime iso={item.scheduledAtIso} fallback={`${item.dateLabel} · ${item.timeLabel}`} />
        {` · ${item.durationMin} min · ${item.participantCount} alumno${item.participantCount === 1 ? "" : "s"}`}
      </span>
      <span className="platform-tag">{item.statusLabel}</span>
    </li>
  );
}

/** What I have today, what is coming and what I still have to document. No advanced analytics. */
export async function TeacherDashboardSection() {
  const dashboard = await getTeacherDashboard();

  return (
    <div className="teacher-dashboard">
      <div className="teacher-dashboard__metrics">
        <div className="platform-card teacher-dashboard__metric">
          <span className="teacher-dashboard__metric-value">{dashboard.today.length}</span>
          <span className="teacher-dashboard__metric-label">Clases hoy</span>
        </div>
        <div className="platform-card teacher-dashboard__metric">
          <span className="teacher-dashboard__metric-value">{dashboard.upcoming.length}</span>
          <span className="teacher-dashboard__metric-label">En los próximos 7 días</span>
        </div>
        <div className="platform-card teacher-dashboard__metric">
          <span className="teacher-dashboard__metric-value">{dashboard.activeStudentCount}</span>
          <span className="teacher-dashboard__metric-label">Alumnos asignados</span>
        </div>
      </div>

      <section className="platform-card">
        <h2 className="platform-card__title">Hoy</h2>
        {dashboard.today.length > 0 ? (
          <ul className="teacher-dashboard__list">
            {dashboard.today.map((item) => (
              <ClassRow key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="teacher-dashboard__empty">No tienes clases programadas para hoy.</p>
        )}
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Próximos 7 días</h2>
        {dashboard.upcoming.length > 0 ? (
          <ul className="teacher-dashboard__list">
            {dashboard.upcoming.map((item) => (
              <ClassRow key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="teacher-dashboard__empty">Nada programado en la próxima semana.</p>
        )}
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Pendientes de documentar</h2>
        {dashboard.pending.length > 0 ? (
          <ul className="teacher-dashboard__list">
            {dashboard.pending.map((item) => (
              <li key={item.id} className="teacher-dashboard__class">
                <Link href={item.href} className="teacher-dashboard__class-title">
                  {item.title}
                </Link>
                <span className="teacher-dashboard__class-meta">
                  <LocalDateTime iso={item.scheduledAtIso} fallback={item.dateLabel} withTime={false} />
                </span>
                {item.needsAttendance && <span className="platform-tag">Falta asistencia</span>}
                {item.needsSummary && <span className="platform-tag">Falta resumen</span>}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Todo al día"
            description="No hay clases terminadas sin asistencia ni resumen."
          />
        )}
      </section>

      <div className="teacher-dashboard__actions">
        <Link href={teacherRoutes.newClass} className="platform-button">
          Crear una clase
        </Link>
        <Link href={teacherRoutes.students} className="platform-button platform-button_variant_secondary">
          Ver mis alumnos
        </Link>
        <Link href={teacherRoutes.classes} className="platform-button platform-button_variant_secondary">
          Todas mis clases
        </Link>
      </div>
    </div>
  );
}
