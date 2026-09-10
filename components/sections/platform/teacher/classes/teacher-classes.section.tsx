import Link from "next/link";
import { LocalDateTime } from "@/components/common/local-datetime.comp";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/common/platform-table.comp";
import { CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import { teacherRoutes } from "@/lib/platform-routes";
import { getTeacherClasses } from "@/services/teacher-classes/teacher-classes.service";
import type { TeacherClassSummary } from "@/services/teacher-classes/teacher-classes.types";
import "./teacher-classes.section.css";

interface TeacherClassesSectionProps {
  /** Filter by status; comes from searchParams and is applied in the `where`. */
  statusCode?: ClassStatusCode;
}

const STATUS_FILTERS: { label: string; code?: ClassStatusCode }[] = [
  { label: "Todas" },
  { label: "Programadas", code: CLASS_STATUS.SCHEDULED },
  { label: "En vivo", code: CLASS_STATUS.LIVE },
  { label: "Terminadas", code: CLASS_STATUS.COMPLETED },
  { label: "Canceladas", code: CLASS_STATUS.CANCELLED },
];

function ClassesTable({ classes, emptyLabel }: { classes: TeacherClassSummary[]; emptyLabel: string }) {
  return (
    <PlatformTable
      columns={[
        "Clase",
        "Fecha",
        { label: "Duración", align: "right" },
        { label: "Alumnos", align: "right" },
        { label: "Asistieron", align: "right" },
        "Estado",
      ]}
      emptyLabel={emptyLabel}
      minWidth={780}
    >
      {classes.map((item) => (
        <PlatformTableRow key={item.id}>
          <PlatformTableCell strong>
            <Link href={item.href}>{item.title}</Link>
          </PlatformTableCell>
          <PlatformTableCell>
            <LocalDateTime iso={item.scheduledAtIso} fallback={`${item.dateLabel} · ${item.timeLabel}`} />
          </PlatformTableCell>
          <PlatformTableCell align="right">{item.durationMin} min</PlatformTableCell>
          <PlatformTableCell align="right">{item.participantCount}</PlatformTableCell>
          <PlatformTableCell align="right">{item.attendedCount}</PlatformTableCell>
          <PlatformTableCell>
            <span className="platform-tag">{item.statusLabel}</span>
          </PlatformTableCell>
        </PlatformTableRow>
      ))}
    </PlatformTable>
  );
}

export async function TeacherClassesSection({ statusCode }: TeacherClassesSectionProps) {
  const classes = await getTeacherClasses(statusCode);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = startOfToday.getTime() + 24 * 60 * 60 * 1000;

  const today = classes.filter((item) => {
    const at = new Date(item.scheduledAtIso).getTime();
    return at >= startOfToday.getTime() && at < endOfToday;
  });
  const upcoming = classes.filter((item) => new Date(item.scheduledAtIso).getTime() >= endOfToday).reverse();
  const past = classes.filter((item) => new Date(item.scheduledAtIso).getTime() < startOfToday.getTime());

  return (
    <div className="teacher-classes">
      <div className="teacher-classes__bar">
        <nav className="teacher-classes__filters" aria-label="Filtrar por estado">
          {STATUS_FILTERS.map((filter) => {
            const href = filter.code ? `${teacherRoutes.classes}?status=${filter.code}` : teacherRoutes.classes;
            const isActive = filter.code === statusCode;
            return (
              <Link
                key={filter.label}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`teacher-classes__filter${isActive ? " teacher-classes__filter_active" : ""}`}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>

        <Link href={teacherRoutes.newClass} className="platform-button">
          Crear una clase
        </Link>
      </div>

      <section className="teacher-classes__group">
        <h2 className="teacher-classes__group-title">Hoy</h2>
        <ClassesTable classes={today} emptyLabel="No tienes clases hoy." />
      </section>

      <section className="teacher-classes__group">
        <h2 className="teacher-classes__group-title">Próximas</h2>
        <ClassesTable classes={upcoming} emptyLabel="No tienes clases próximas." />
      </section>

      <section className="teacher-classes__group">
        <h2 className="teacher-classes__group-title">Pasadas</h2>
        <ClassesTable classes={past} emptyLabel="Todavía no has impartido ninguna clase." />
      </section>
    </div>
  );
}
