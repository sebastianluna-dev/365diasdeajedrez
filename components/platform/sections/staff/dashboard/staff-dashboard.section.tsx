import Link from "next/link";
import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { LocalDateTime } from "@/components/platform/shared/local-datetime.comp";
import { staffRoutes } from "@/lib/platform-routes";
import { getStaffDashboard } from "@/services/staff/staff.service";
import "./staff-dashboard.section.css";

export async function StaffDashboardSection() {
  const dashboard = await getStaffDashboard();

  return (
    <div className="staff-dashboard">
      <div className="staff-dashboard__metrics">
        <div className="platform-card staff-dashboard__metric">
          <span className="staff-dashboard__metric-value">{dashboard.studentCount}</span>
          <span className="staff-dashboard__metric-label">Alumnos</span>
        </div>
        <div className="platform-card staff-dashboard__metric">
          <span className="staff-dashboard__metric-value">{dashboard.activeTeacherCount}</span>
          <span className="staff-dashboard__metric-label">Profesores activos</span>
        </div>
        <div className="platform-card staff-dashboard__metric">
          <span className="staff-dashboard__metric-value">{dashboard.inactiveTeacherCount}</span>
          <span className="staff-dashboard__metric-label">Profesores desactivados</span>
        </div>
        <div className="platform-card staff-dashboard__metric">
          <span className="staff-dashboard__metric-value">{dashboard.unassignedStudents.length}</span>
          <span className="staff-dashboard__metric-label">Alumnos sin profesor</span>
        </div>
      </div>

      <section className="platform-card">
        <h2 className="platform-card__title">Alumnos sin profesor asignado</h2>
        {dashboard.unassignedStudents.length > 0 ? (
          <ul className="staff-dashboard__list">
            {dashboard.unassignedStudents.map((student) => (
              <li key={student.id} className="staff-dashboard__item">
                <Link href={student.href} className="staff-dashboard__item-title">
                  {student.displayName}
                </Link>
                <span className="staff-dashboard__item-meta">{student.email}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Todos los alumnos tienen profesor" />
        )}
      </section>

      <div className="staff-dashboard__row">
        <section className="platform-card">
          <h2 className="platform-card__title">Cursos por estado</h2>
          <ul className="staff-dashboard__list">
            {dashboard.coursesByStatus.map((status) => (
              <li key={status.code} className="staff-dashboard__item">
                <span className="staff-dashboard__item-title">{status.label}</span>
                <span className="staff-dashboard__item-meta">{status.count}</span>
              </li>
            ))}
          </ul>
          <Link href={staffRoutes.courses} className="platform-button platform-button_variant_secondary">
            Gestionar cursos
          </Link>
        </section>

        <section className="platform-card">
          <h2 className="platform-card__title">Clases de los próximos 7 días</h2>
          {dashboard.upcomingClasses.length > 0 ? (
            <ul className="staff-dashboard__list">
              {dashboard.upcomingClasses.map((upcomingClass) => (
                <li key={upcomingClass.id} className="staff-dashboard__item">
                  <Link href={upcomingClass.href} className="staff-dashboard__item-title">
                    {upcomingClass.title}
                  </Link>
                  <span className="staff-dashboard__item-meta">
                    {upcomingClass.teacherName} ·{" "}
                    <LocalDateTime iso={upcomingClass.scheduledAtIso} fallback={upcomingClass.dateLabel} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="staff-dashboard__empty">No hay clases programadas esta semana.</p>
          )}
        </section>
      </div>

      <p className="staff-dashboard__note">
        Los catálogos técnicos (temas, niveles, tipos de curso, estados…) se gestionan por seed, no desde aquí: sus
        códigos son estables y la lógica de la plataforma los compara por código.
      </p>
    </div>
  );
}
