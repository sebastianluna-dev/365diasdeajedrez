import Link from "next/link";
import { ClassRow } from "@/components/platform/shared/class-row/class-row.comp";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { ClassWhen } from "@/components/platform/shared/class-when/class-when.comp";
import { FilterPills } from "@/components/platform/shared/filter-pills/filter-pills.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformTable,
  PlatformTableCell,
  PlatformTableRow,
} from "@/components/platform/shared/platform-table/platform-table.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import { finalizeClass } from "@/services/teacher-classes/teacher-classes.actions";
import type { TeacherClassesTab, TeacherClassesView } from "@/services/teacher-classes/teacher-classes.types";
import { TeacherClassesSearch } from "./teacher-classes-search.comp";
import "./teacher-classes.section.css";

interface TeacherClassesSectionProps {
  view: TeacherClassesView;
  notice?: string;
  errorMessage?: string;
}

const TABS: { vista: TeacherClassesTab; label: string }[] = [
  { vista: "proximas", label: "Próximas" },
  { vista: "por-finalizar", label: "Por finalizar" },
  { vista: "pasadas", label: "Pasadas" },
  { vista: "canceladas", label: "Canceladas" },
];

/**
 * «Clases que imparto»: the four views as pills, the search, and the rows —
 * «Pasadas» as a table above 640px and as cards below it (§2.4 of the plan)
 * —, twenty at a time with «Ver más». A Server Component: it imports the
 * finalizing action and hands it to the rows as a prop.
 */
export function TeacherClassesSection({ view, notice, errorMessage }: TeacherClassesSectionProps) {
  const { filters, rows, total, page, pageSize, awaitingCloseCount, timeZone, nowIso } = view;
  const serverActions = { finalize: finalizeClass };
  const emptyLine =
    filters.vista === "proximas"
      ? "No tienes clases próximas."
      : filters.vista === "por-finalizar"
        ? "Nada por finalizar."
        : filters.vista === "pasadas"
          ? "Todavía no has dado ninguna clase."
          : "No tienes clases canceladas.";

  return (
    <div className="teacher-classes">
      {errorMessage && <PlatformNotice message={errorMessage} />}
      {notice && <PlatformNotice message={notice} variant="success" />}
      <div className="teacher-classes__bar">
        <FilterPills
          label="Vista"
          pills={TABS.map((tab) => ({
            label: tab.label,
            href: teacherRoutes.classesFiltered({ vista: tab.vista, q: filters.q }),
            active: tab.vista === filters.vista,
            ...(tab.vista === "por-finalizar" && awaitingCloseCount > 0 ? { count: awaitingCloseCount } : {}),
          }))}
        />
        <TeacherClassesSearch filters={filters} />
      </div>

      {rows.length === 0 ? (
        <p className="teacher-classes__empty">{emptyLine}</p>
      ) : filters.vista === "pasadas" ? (
        <div className="teacher-classes__past">
          <div className="teacher-classes__past-table">
            <PlatformTable
              label="Clases pasadas"
              columns={["Fecha", "Clase", "Alumnos", "Asistencia", "Material"]}
              minWidth={760}
            >
              {rows.map((row) => (
                <PlatformTableRow key={row.id}>
                  <PlatformTableCell>
                    <ClassWhen
                      startIso={row.startIso}
                      durationMin={row.durationMin}
                      timeZone={timeZone}
                      nowIso={nowIso}
                    />
                  </PlatformTableCell>
                  <PlatformTableCell strong>
                    <Link href={row.href}>{row.title}</Link> <ClassStatusTag phase={row.phase} audience="teacher" />
                  </PlatformTableCell>
                  <PlatformTableCell>{row.studentsLabel}</PlatformTableCell>
                  <PlatformTableCell>{row.attendanceLabel}</PlatformTableCell>
                  <PlatformTableCell>{row.materialLabel}</PlatformTableCell>
                </PlatformTableRow>
              ))}
            </PlatformTable>
          </div>
          <ul className="teacher-classes__cards teacher-classes__past-cards">
            {rows.map((row) => (
              <li key={row.id} className="teacher-classes__card">
                <ClassRow row={row} audience="teacher" />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="teacher-classes__cards">
          {rows.map((row) => (
            <li key={row.id} className="teacher-classes__card">
              <ClassRow row={row} audience="teacher" serverActions={serverActions} />
            </li>
          ))}
        </ul>
      )}

      {rows.length < total && (
        <p className="teacher-classes__more">
          <Link
            href={teacherRoutes.classesFiltered({ vista: filters.vista, q: filters.q, pagina: page + 1 })}
            className="platform-button"
          >
            Ver más
          </Link>
          <span className="teacher-classes__count">
            {rows.length} de {total}
          </span>
        </p>
      )}
      {rows.length >= total && total > pageSize && (
        <p className="teacher-classes__count">
          {total} clase{total === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
