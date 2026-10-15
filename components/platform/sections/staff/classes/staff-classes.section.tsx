import Link from "next/link";
import { ClassAgenda } from "@/components/platform/shared/class-agenda/class-agenda.comp";
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
import { staffRoutes } from "@/lib/platform-routes";
import { scheduleSeat, setClassMeeting } from "@/services/staff-classes/staff-classes.actions";
import type { StaffAgendaTab, StaffAgendaView, StaffQueuesView } from "@/services/staff-classes/staff-classes.types";
import { loadPaymentContext, loadTeacherBusy, registerPayment } from "@/services/staff-payments/staff-payments.actions";
import type { OpenGroupClassOption, TeacherOption } from "@/services/staff-payments/staff-payments.types";
import { AgendaFilters } from "./agenda-filters.comp";
import { StaffClassQueues } from "./queues/staff-class-queues.comp";
import "./staff-classes.section.css";

interface StaffClassesSectionProps {
  agenda: StaffAgendaView;
  queues: StaffQueuesView;
  /** Every teacher, for the filter; the active ones, for the popups that date a class. */
  teacherFilter: { id: string; displayName: string }[];
  teachers: TeacherOption[];
  groupClasses: OpenGroupClassOption[];
  /** The success the address says, already in words, or the error's message. */
  notice?: string;
  errorMessage?: string;
}

const TABS: { vista: StaffAgendaTab; label: string }[] = [
  { vista: "proximas", label: "Próximas" },
  { vista: "pasadas", label: "Pasadas" },
  { vista: "canceladas", label: "Canceladas" },
];

/**
 * The staff's agenda (ADM-1): the three views as pills, the teacher and the
 * text as filters, the classes by day (or the past ones as a table, or the
 * cancelled ones), and the queues beside them. A Server Component: it
 * imports the actions and hands them to the client pieces as props.
 */
export function StaffClassesSection({
  agenda,
  queues,
  teacherFilter,
  teachers,
  groupClasses,
  notice,
  errorMessage,
}: StaffClassesSectionProps) {
  const { filters, timeZone, nowIso } = agenda;
  const hrefOf = (vista: StaffAgendaTab) =>
    staffRoutes.classesFiltered({ vista, profesor: filters.teacherId, q: filters.q });
  const serverActions = { setMeeting: setClassMeeting };

  return (
    <div className="staff-agenda">
      <div className="staff-agenda__main">
        {errorMessage && <PlatformNotice message={errorMessage} />}
        {notice && <PlatformNotice message={notice} variant="success" />}
        <div className="staff-agenda__bar">
          <FilterPills
            label="Vista"
            pills={TABS.map((tab) => ({
              label: tab.label,
              href: hrefOf(tab.vista),
              active: tab.vista === filters.vista,
            }))}
          />
          <AgendaFilters filters={filters} teachers={teacherFilter} />
        </div>

        {filters.vista === "proximas" && (
          <ClassAgenda
            days={agenda.days}
            audience="staff"
            emptyLine="No hay clases en estos días."
            foot={{ label: `${agenda.foot.untilLabel} · Ver la semana siguiente`, href: agenda.foot.nextHref }}
            serverActions={serverActions}
          />
        )}

        {filters.vista === "pasadas" && <PastClasses agenda={agenda} />}

        {filters.vista === "canceladas" &&
          (agenda.cancelled.length === 0 ? (
            <p className="staff-agenda__empty">No hay clases canceladas.</p>
          ) : (
            <ul className="staff-agenda__cards">
              {agenda.cancelled.map((row) => (
                <li key={row.id} className="staff-agenda__card">
                  <ClassRow row={row} audience="staff" />
                </li>
              ))}
            </ul>
          ))}
      </div>

      <aside className="staff-agenda__aside" aria-label="Pendientes">
        <StaffClassQueues
          queues={queues}
          teachers={teachers}
          groupClasses={groupClasses}
          timeZone={timeZone}
          nowIso={nowIso}
          actions={{ scheduleSeat, setMeeting: setClassMeeting, registerPayment, loadPaymentContext, loadTeacherBusy }}
        />
      </aside>
    </div>
  );
}

/** «Pasadas»: a table above 640px, cards below, fifty at a time. */
function PastClasses({ agenda }: { agenda: StaffAgendaView }) {
  const { past, filters, timeZone, nowIso } = agenda;
  if (past.total === 0) return <p className="staff-agenda__empty">No hay clases pasadas con esos filtros.</p>;
  const first = (past.page - 1) * past.pageSize + 1;
  const last = Math.min(past.total, past.page * past.pageSize);
  const pageHref = (pagina: number) =>
    staffRoutes.classesFiltered({ vista: "pasadas", profesor: filters.teacherId, q: filters.q, pagina });

  return (
    <div className="staff-agenda__past">
      <div className="staff-agenda__past-table">
        <PlatformTable
          label="Clases pasadas"
          columns={[
            "Fecha",
            "Clase",
            "Profesor",
            "Estado",
            { label: "Alumnos", align: "right" },
            { label: "Asistieron", align: "right" },
          ]}
          minWidth={880}
        >
          {past.rows.map((row) => (
            <PlatformTableRow key={row.id}>
              <PlatformTableCell>
                <ClassWhen startIso={row.startIso} durationMin={row.durationMin} timeZone={timeZone} nowIso={nowIso} />
              </PlatformTableCell>
              <PlatformTableCell strong>
                <Link href={row.href}>{row.title}</Link>
              </PlatformTableCell>
              <PlatformTableCell>{row.teacherName}</PlatformTableCell>
              <PlatformTableCell>
                <ClassStatusTag phase={row.phase} audience="staff" />
              </PlatformTableCell>
              <PlatformTableCell align="right">{row.participantCount}</PlatformTableCell>
              <PlatformTableCell align="right">{row.attendedCount}</PlatformTableCell>
            </PlatformTableRow>
          ))}
        </PlatformTable>
      </div>
      <ul className="staff-agenda__cards staff-agenda__past-cards">
        {past.rows.map((row) => (
          <li key={row.id} className="staff-agenda__card">
            <ClassRow row={row} audience="staff" />
          </li>
        ))}
      </ul>
      <p className="staff-agenda__paging">
        <span>
          Mostrando {first}–{last} de {past.total}
        </span>
        {past.page > 1 && (
          <Link href={pageHref(past.page - 1)} className="staff-agenda__paging-link">
            Anteriores
          </Link>
        )}
        {last < past.total && (
          <Link href={pageHref(past.page + 1)} className="staff-agenda__paging-link">
            Siguientes
          </Link>
        )}
      </p>
    </div>
  );
}
