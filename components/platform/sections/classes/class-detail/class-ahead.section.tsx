import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { TicketIcon } from "@/components/icons/ticket-icon.comp";
import { ClassContentRenderer } from "@/components/platform/shared/class-content-renderer/class-content-renderer.comp";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { ClassWhen } from "@/components/platform/shared/class-when/class-when.comp";
import { MeetingJoinCard } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { ClassDetailView } from "@/services/classes/classes.types";
import "./class-ahead.section.css";

interface ClassAheadSectionProps {
  classDetail: ClassDetailView;
  /** The address's notice, already in words, or the error's message. */
  notice?: string;
  errorMessage?: string;
}

/** What a cancelled class tells the student: the staff's note and where the seat went. */
function cancelledMessage(cancelled: NonNullable<ClassDetailView["cancelled"]>): string {
  const parts = ["Esta clase se canceló."];
  if (cancelled.note) parts.push(cancelled.note);
  if (cancelled.returnedToPayment) parts.push("Tu clase pagada sigue en pie: la programaremos contigo.");
  return parts.join(" ");
}

/**
 * The class page while it looks AHEAD (ALU-2): the way back, the phase, the
 * topic and when, the access card — «Entrar a la clase» when the link is
 * open, the countdown before, «Volver a entrar» in the half hour after the
 * end —, what the staff said (a new date, a cancellation, a make-up), «Tu
 * clase» with who it is with (and «Esta clase es gratis.» when it is; never
 * which payment it belongs to), and what there is to prepare.
 */
export function ClassAheadSection({ classDetail, notice, errorMessage }: ClassAheadSectionProps) {
  const cancelled = classDetail.cancelled !== null;
  return (
    <div className="class-ahead">
      <header className="platform-page__head">
        <Link href={platformRoutes.classes} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Mis clases
        </Link>
        <p className="class-ahead__tags">
          <ClassStatusTag phase={classDetail.phase} audience="student" />
        </p>
        <h1 className="platform-page__title class-ahead__title">{classDetail.title}</h1>
        <p className="platform-page__subtitle">
          <ClassWhen
            startIso={classDetail.startIso}
            durationMin={classDetail.durationMin}
            timeZone={classDetail.timeZone}
            nowIso={classDetail.nowIso}
            withZone
          />{" "}
          · {classDetail.people}
        </p>
        {classDetail.description && <p className="class-ahead__description">{classDetail.description}</p>}
      </header>

      {errorMessage && <PlatformNotice message={errorMessage} />}
      {notice && <PlatformNotice message={notice} variant="success" />}
      {classDetail.cancelled && <PlatformNotice variant="warning" message={cancelledMessage(classDetail.cancelled)} />}
      {classDetail.rescheduled && (
        <PlatformNotice
          variant="info"
          message={`Reprogramada desde el ${classDetail.rescheduled.previousLabel}.${classDetail.rescheduled.note ? ` Nota: ${classDetail.rescheduled.note}` : ""}`}
        />
      )}
      {classDetail.makeUp && (
        <PlatformNotice
          variant="info"
          message={`${classDetail.makeUp.label}${classDetail.makeUp.note ? ` Nota: ${classDetail.makeUp.note}` : ""}`}
        />
      )}

      {!cancelled && (
        <div className="platform-card class-ahead__access">
          <h2 className="platform-card__title">Cómo entrar</h2>
          <MeetingJoinCard {...classDetail.join} audience="student" density="full" />
        </div>
      )}

      <div className="class-ahead__columns">
        <div className="platform-card class-ahead__seat">
          <h2 className="platform-card__title class-ahead__seat-title">
            <TicketIcon className="class-ahead__seat-icon" />
            Tu clase
          </h2>
          <p className="class-ahead__seat-line">{classDetail.people.replace(/^con /, "Con ")}</p>
          {classDetail.coverage && <p className="class-ahead__seat-line">{classDetail.coverage}</p>}
        </div>

        {!cancelled && (
          <div className="class-ahead__prepare">
            <h2 id="para-preparar" className="class-ahead__prepare-title">
              Para preparar
            </h2>
            {classDetail.blocks.length > 0 ? (
              <ClassContentRenderer blocks={classDetail.blocks} />
            ) : (
              <p className="class-ahead__empty">Tu profesor todavía no agregó material para preparar.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
