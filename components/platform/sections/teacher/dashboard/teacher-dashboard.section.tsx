import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { ClassAgenda } from "@/components/platform/shared/class-agenda/class-agenda.comp";
import { ClassDateTile } from "@/components/platform/shared/class-date-tile/class-date-tile.comp";
import { ClassRow } from "@/components/platform/shared/class-row/class-row.comp";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { MeetingJoinCard } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { dayKeyIn } from "@/lib/timezone";
import { teacherRoutes } from "@/lib/platform-routes";
import { finalizeClass } from "@/services/teacher-classes/teacher-classes.actions";
import type { TeacherDashboard } from "@/services/teacher/teacher.types";
import "./teacher-dashboard.section.css";

interface TeacherDashboardSectionProps {
  dashboard: TeacherDashboard;
  notice?: string;
  errorMessage?: string;
}

/**
 * The teacher's panel (PROF-1): the next class with how to join it — the
 * priority is entering, then finalizing, then preparing —, the classes
 * that wait to be finalized with «Finalizar» on each row, and this week by
 * day. Nothing is created here: the dates, the students and the links are
 * the staff's. A Server Component: it hands the finalizing action down.
 */
export function TeacherDashboardSection({ dashboard, notice, errorMessage }: TeacherDashboardSectionProps) {
  const { next, awaitingClose, week, timeZone, nowIso } = dashboard;
  const serverActions = { finalize: finalizeClass };
  const now = new Date(nowIso);

  return (
    <div className="teacher-dashboard">
      {errorMessage && <PlatformNotice message={errorMessage} />}
      {notice && <PlatformNotice message={notice} variant="success" />}

      <section className="platform-card teacher-dashboard__next" aria-labelledby="proxima">
        <h2 id="proxima" className="teacher-dashboard__eyebrow">
          Tu próxima clase
        </h2>
        {next ? (
          <div className="teacher-dashboard__next-body">
            <ClassDateTile
              startIso={next.row.startIso}
              timeZone={timeZone}
              isToday={dayKeyIn(new Date(next.row.startIso), timeZone) === dayKeyIn(now, timeZone)}
            />
            <div className="teacher-dashboard__next-text">
              <ClassStatusTag phase={next.row.phase} audience="teacher" />
              <h3 className="teacher-dashboard__next-title">
                <Link href={next.row.href}>{next.row.title}</Link>
              </h3>
              <p className="teacher-dashboard__next-people">{next.row.people}</p>
              {next.row.chips.length > 0 && (
                <p className="teacher-dashboard__next-chips">{next.row.chips.map((chip) => chip.label).join(" · ")}</p>
              )}
              <MeetingJoinCard {...next.join} audience="teacher" density="full" />
              <p className="teacher-dashboard__next-actions">
                <Link href={next.row.href} className="platform-button">
                  Preparar la clase
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <p className="teacher-dashboard__empty">No tienes clases por delante. Administración las programa contigo.</p>
        )}
      </section>

      {awaitingClose.length > 0 && (
        <section className="teacher-dashboard__group" aria-labelledby="por-finalizar">
          <h2 id="por-finalizar" className="teacher-dashboard__group-title">
            Por finalizar
          </h2>
          <ul className="teacher-dashboard__rows">
            {awaitingClose.map((row) => (
              <li key={row.id} className="teacher-dashboard__row">
                <ClassRow row={row} audience="teacher" serverActions={serverActions} />
              </li>
            ))}
          </ul>
          <p className="teacher-dashboard__note">Al finalizarla, tus alumnos ven tu resumen y la grabación.</p>
        </section>
      )}

      <section className="teacher-dashboard__group" aria-labelledby="semana">
        <h2 id="semana" className="teacher-dashboard__group-title">
          Esta semana
        </h2>
        <ClassAgenda
          days={week}
          audience="teacher"
          emptyLine="No hay clases esta semana."
          serverActions={serverActions}
        />
        <p className="teacher-dashboard__all">
          <Link href={teacherRoutes.classes} className="teacher-dashboard__all-link">
            Ver todas mis clases
            <ChevronRightIcon variant="classic-solid" className="teacher-dashboard__all-icon" />
          </Link>
        </p>
      </section>
    </div>
  );
}
