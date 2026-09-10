import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state.comp";
import { LocalDateTime } from "@/components/common/local-datetime.comp";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/common/platform-table.comp";
import { ProgressIndicator } from "@/components/common/progress-indicator.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import type { AssignedStudentDetail, StudentSharedClass } from "@/services/teacher-students/teacher-students.types";
import "./assigned-student-detail.section.css";

interface AssignedStudentDetailSectionProps {
  student: AssignedStudentDetail;
}

function ClassList({ classes, emptyLabel }: { classes: StudentSharedClass[]; emptyLabel: string }) {
  if (classes.length === 0) return <p className="assigned-student__empty">{emptyLabel}</p>;

  return (
    <ul className="assigned-student__classes">
      {classes.map((item) => (
        <li key={item.id} className="assigned-student__class">
          <Link href={item.href} className="assigned-student__class-title">
            {item.title}
          </Link>
          <span className="assigned-student__class-meta">
            <LocalDateTime iso={item.scheduledAtIso} fallback={item.dateLabel} />
          </span>
          <span className="platform-tag">{item.statusLabel}</span>
          {item.attended && <span className="platform-tag platform-tag_variant_accent">Asistió</span>}
        </li>
      ))}
    </ul>
  );
}

/**
 * The student's page for their teacher. Everything seen here is READ-ONLY: the
 * student's studies are theirs and the teacher consults them, does not edit
 * them (which is why there is not a single write control on them).
 */
export function AssignedStudentDetailSection({ student }: AssignedStudentDetailSectionProps) {
  return (
    <div className="assigned-student">
      <section className="platform-card">
        <h2 className="platform-card__title">Datos</h2>
        <dl className="assigned-student__facts">
          <div className="assigned-student__fact">
            <dt className="assigned-student__fact-label">Email</dt>
            <dd className="assigned-student__fact-value">{student.email}</dd>
          </div>
          <div className="assigned-student__fact">
            <dt className="assigned-student__fact-label">Asignado desde</dt>
            <dd className="assigned-student__fact-value">
              <LocalDateTime iso={student.assignedAtIso} fallback={student.assignedAtLabel} withTime={false} />
            </dd>
          </div>
          {student.note && (
            <div className="assigned-student__fact">
              <dt className="assigned-student__fact-label">Nota de la asignación</dt>
              <dd className="assigned-student__fact-value">{student.note}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Progreso en cursos</h2>
        {student.courses.length > 0 ? (
          <ul className="assigned-student__courses">
            {student.courses.map((course) => (
              <li key={course.courseId} className="assigned-student__course">
                <div className="assigned-student__course-head">
                  <span className="assigned-student__course-name">{course.courseName}</span>
                  <span className="platform-tag">{course.statusLabel}</span>
                </div>
                <ProgressIndicator
                  percent={course.percent}
                  detail={`${course.completedLessons} de ${course.totalLessons} lecciones`}
                />
                {course.lastLessonName && (
                  <span className="assigned-student__course-last">Última lección: {course.lastLessonName}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="assigned-student__empty">Este alumno todavía no ha empezado ningún curso.</p>
        )}
      </section>

      <div className="assigned-student__row">
        <section className="platform-card">
          <h2 className="platform-card__title">Próximas clases conmigo</h2>
          <ClassList classes={student.upcomingClasses} emptyLabel="No hay clases próximas con este alumno." />
        </section>

        <section className="platform-card">
          <h2 className="platform-card__title">Clases pasadas conmigo</h2>
          <ClassList classes={student.pastClasses} emptyLabel="Todavía no habéis tenido ninguna clase." />
        </section>
      </div>

      <section className="platform-card">
        <h2 className="platform-card__title">Estudios del alumno</h2>
        <p className="assigned-student__note">
          Sólo lectura: puedes consultarlos y referenciar una partida en una clase, pero no modificarlos.
        </p>
        <PlatformTable
          columns={["Estudio", "Tipo", { label: "Partidas", align: "right" }, "Actualizado"]}
          emptyLabel="Este alumno todavía no tiene estudios propios."
          minWidth={560}
        >
          {student.studies.map((study) => (
            <PlatformTableRow key={study.id}>
              <PlatformTableCell strong>
                <Link href={teacherRoutes.studentStudy(student.id, study.id)}>{study.name}</Link>
              </PlatformTableCell>
              <PlatformTableCell>{study.kindLabel}</PlatformTableCell>
              <PlatformTableCell align="right">{study.gameCount}</PlatformTableCell>
              <PlatformTableCell>{study.updatedAtLabel}</PlatformTableCell>
            </PlatformTableRow>
          ))}
        </PlatformTable>
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Actividad reciente</h2>
        {student.activity.length > 0 ? (
          <ul className="assigned-student__activity">
            {student.activity.map((item) => (
              <li key={item.id} className="assigned-student__activity-item">
                <span className="assigned-student__activity-label">
                  {item.typeLabel} · {item.subjectTypeLabel}
                </span>
                <span className="assigned-student__activity-date">
                  <LocalDateTime iso={item.occurredAtIso} fallback={item.occurredAtLabel} withTime={false} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Sin actividad registrada" description="Cuando el alumno estudie, aparecerá aquí." />
        )}
      </section>
    </div>
  );
}
