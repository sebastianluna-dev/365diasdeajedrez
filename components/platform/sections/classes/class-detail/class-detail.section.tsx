import Link from "next/link";
import { ClassContentRenderer } from "@/components/platform/shared/class-content-renderer.comp";
import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { LocalDateTime } from "@/components/platform/shared/local-datetime.comp";
import { CLASS_STATUS, TRANSCRIPT_STATUS } from "@/constants/platform/class-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { ClassDetail } from "@/services/classes/classes.types";
import { MeetingAccess } from "./meeting-access.comp";
import "./class-detail.section.css";

interface ClassDetailSectionProps {
  classDetail: ClassDetail;
}

export function ClassDetailSection({ classDetail }: ClassDetailSectionProps) {
  const isUpcoming =
    classDetail.statusCode === CLASS_STATUS.SCHEDULED || classDetail.statusCode === CLASS_STATUS.LIVE;

  return (
    <section className="class-detail">
      <nav className="class-detail__breadcrumb" aria-label="Ruta de clases">
        <Link href={platformRoutes.classes} className="class-detail__breadcrumb-link">
          Mis clases
        </Link>
        <span className="class-detail__breadcrumb-separator">/</span>
        <span className="class-detail__breadcrumb-current">{classDetail.title}</span>
      </nav>

      <header className="class-detail__head">
        <span className="platform-tag platform-tag_variant_accent">{classDetail.statusLabel}</span>
        <h1 className="platform-page__title">{classDetail.title}</h1>
        {classDetail.description && <p className="platform-page__subtitle">{classDetail.description}</p>}
        <p className="class-detail__meta">
          {classDetail.teacherName}
          {classDetail.teacherTitle ? ` · ${classDetail.teacherTitle}` : ""} ·{" "}
          <LocalDateTime
            iso={classDetail.scheduledAtIso}
            fallback={`${classDetail.dateLabel} · ${classDetail.timeLabel}`}
          />{" "}
          · {classDetail.durationMin} min
        </p>

        {isUpcoming && (
          <MeetingAccess
            meetingUrl={classDetail.meetingUrl}
            meetingVisibleFromIso={classDetail.meetingVisibleFromIso}
            providerLabel={classDetail.meetingProviderLabel}
          />
        )}

        {classDetail.recordingUrl && (
          <a
            href={classDetail.recordingUrl}
            target="_blank"
            rel="noreferrer"
            className="platform-button platform-button_variant_secondary"
          >
            Ver grabación
          </a>
        )}
      </header>

      {classDetail.summary && (
        <div className="platform-card class-detail__summary">
          <h2 className="platform-card__title">Resumen</h2>
          <p className="class-detail__summary-text">{classDetail.summary}</p>
        </div>
      )}

      <div className="class-detail__content">
        <h2 className="class-detail__content-title">Contenido de la clase</h2>
        {classDetail.blocks.length > 0 ? (
          <ClassContentRenderer blocks={classDetail.blocks} />
        ) : (
          <EmptyState
            title="Sin contenido registrado"
            description={
              isUpcoming
                ? "El material aparecerá aquí después de la clase."
                : "Esta clase no tiene material registrado."
            }
          />
        )}
      </div>

      {classDetail.transcript && (
        <div className="platform-card class-detail__transcript">
          <h2 className="platform-card__title">Transcripción</h2>
          {classDetail.transcript.statusCode === TRANSCRIPT_STATUS.READY && classDetail.transcript.text ? (
            <p className="class-detail__transcript-text">{classDetail.transcript.text}</p>
          ) : (
            <p className="class-detail__transcript-status">
              Estado de la transcripción: {classDetail.transcript.statusLabel}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
