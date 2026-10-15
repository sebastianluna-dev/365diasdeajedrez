import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { CircleVideoIcon } from "@/components/icons/circle-video-icon.comp";
import { TicketIcon } from "@/components/icons/ticket-icon.comp";
import { UserCheckIcon } from "@/components/icons/user-check-icon.comp";
import {
  ClassContentRenderer,
  type SaveGameOffer,
} from "@/components/platform/shared/class-content-renderer/class-content-renderer.comp";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { ClassWhen } from "@/components/platform/shared/class-when/class-when.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { TRANSCRIPT_STATUS } from "@/constants/platform/class-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { ClassBlockView, ClassDetailView } from "@/services/classes/classes.types";
import "./class-review.section.css";

interface ClassReviewSectionProps {
  classDetail: ClassDetailView;
  /** The student's studies and the action, to keep a game seen in class; without them, no «Guardar». */
  saveGame?: Omit<SaveGameOffer, "classId">;
  notice?: string;
  /** With the notice, where what it names is: «Ver la copia». */
  noticeLink?: { href: string; label: string };
  errorMessage?: string;
}

/** The heading a block gets in the index: its title, the material's name, or the kind's word. */
function indexLabel(block: ClassBlockView): string {
  if (block.title) return block.title;
  switch (block.kind) {
    case "GAME_REF":
      return block.game.label;
    case "LESSON_REF":
      return block.lesson.name;
    case "POSITION_REF":
      return block.position.title ?? "Posición";
    case "VIDEO":
      return "Video";
    case "FILE":
      return "Archivo";
    default:
      return "Nota";
  }
}

/**
 * The class page once it is over (ALU-3): the phase (the student reads
 * «Finalizada», never «Por finalizar»), whether they came and where a moved
 * seat went, the recording, the teacher's summary, the material with an
 * index, the transcript folded when it is ready, and «Tu clase» with what
 * is left of the payment.
 */
export function ClassReviewSection({
  classDetail,
  saveGame,
  notice,
  noticeLink,
  errorMessage,
}: ClassReviewSectionProps) {
  const transcript =
    classDetail.transcript?.statusCode === TRANSCRIPT_STATUS.READY && classDetail.transcript.text
      ? classDetail.transcript.text
      : null;
  return (
    <div className="class-review">
      <header className="platform-page__head">
        <Link href={platformRoutes.classes} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Mis clases
        </Link>
        <p className="class-review__tags">
          <ClassStatusTag phase={classDetail.phase} audience="student" />
          {classDetail.moved ? (
            <span className="platform-tag platform-tag_variant_warning">
              <UserCheckIcon variant="classic-solid" className="platform-tag__icon" />
              {classDetail.moved.href ? (
                <Link href={classDetail.moved.href} className="class-review__moved">
                  {classDetail.moved.label}
                </Link>
              ) : (
                classDetail.moved.label
              )}
            </span>
          ) : (
            classDetail.attended !== null && (
              <span
                className={`platform-tag${classDetail.attended ? " platform-tag_variant_success" : " platform-tag_variant_warning"}`}
              >
                <UserCheckIcon variant="classic-solid" className="platform-tag__icon" />
                {classDetail.attended ? "Asististe" : "No asististe"}
              </span>
            )
          )}
        </p>
        <h1 className="platform-page__title class-review__title">{classDetail.title}</h1>
        <p className="platform-page__subtitle">
          <ClassWhen
            startIso={classDetail.startIso}
            durationMin={classDetail.durationMin}
            timeZone={classDetail.timeZone}
            nowIso={classDetail.nowIso}
          />{" "}
          · {classDetail.people}
        </p>
        {classDetail.recordingUrl && (
          <div className="platform-page__actions">
            <a
              href={classDetail.recordingUrl}
              target="_blank"
              rel="noreferrer"
              className="platform-button platform-button_variant_accent"
            >
              <CircleVideoIcon variant="classic-solid" className="platform-button__icon" />
              Ver la grabación
              <span className="class-review__sr">(se abre en una pestaña nueva)</span>
            </a>
          </div>
        )}
      </header>

      {errorMessage && <PlatformNotice message={errorMessage} />}
      {notice && (
        <div className="class-review__notice">
          <PlatformNotice message={notice} variant="success" />
          {noticeLink && (
            <Link href={noticeLink.href} className="class-review__notice-link">
              {noticeLink.label}
            </Link>
          )}
        </div>
      )}

      <div className="class-review__columns">
        <div className="class-review__main">
          {classDetail.summary && (
            <div className="platform-card class-review__summary">
              <h2 className="platform-card__title">Resumen</h2>
              <p className="class-review__summary-text">{classDetail.summary}</p>
            </div>
          )}

          <div className="class-review__material">
            <h2 className="class-review__material-title">Material de la clase</h2>
            {classDetail.blocks.length > 0 ? (
              <ClassContentRenderer
                blocks={classDetail.blocks}
                saveGame={saveGame ? { classId: classDetail.id, ...saveGame } : undefined}
              />
            ) : (
              <p className="class-review__empty">
                {classDetail.summary
                  ? "Esta clase no tiene material."
                  : "Tu profesor todavía no escribió el resumen ni agregó material."}
              </p>
            )}
          </div>

          {transcript && (
            <details className="platform-card class-review__transcript">
              <summary className="class-review__transcript-summary">Transcripción</summary>
              <p className="class-review__transcript-text">{transcript}</p>
            </details>
          )}
        </div>

        <aside className="class-review__lane">
          {classDetail.blocks.length > 1 && (
            <nav className="platform-card class-review__index" aria-label="En esta clase">
              <p className="class-review__index-title">En esta clase</p>
              <ol className="class-review__index-list">
                {classDetail.blocks.map((block) => (
                  <li key={block.id}>
                    <a href={`#bloque-${block.id}`} className="class-review__index-link">
                      {indexLabel(block)}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="platform-card class-review__seat">
            <h2 className="platform-card__title class-review__seat-title">
              <TicketIcon className="class-review__seat-icon" />
              Tu clase
            </h2>
            {classDetail.coverage && <p className="class-review__seat-line">{classDetail.coverage}</p>}
            {classDetail.makeUp && (
              <p className="class-review__seat-line class-review__seat-line_tone_muted">{classDetail.makeUp.label}</p>
            )}
            {classDetail.balanceLine && (
              <p className="class-review__seat-line class-review__seat-line_tone_muted">{classDetail.balanceLine}</p>
            )}
            <Link href={platformRoutes.classes} className="class-review__seat-link">
              Ver mis clases
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
