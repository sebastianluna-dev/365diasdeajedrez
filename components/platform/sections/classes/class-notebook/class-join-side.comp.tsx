import { CirclePlayIcon } from "@/components/icons/circle-play-icon.comp";
import { UserCheckIcon } from "@/components/icons/user-check-icon.comp";
import { UserXmarkIcon } from "@/components/icons/user-xmark-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { MeetingCountdown } from "@/components/platform/shared/meeting-countdown/meeting-countdown.comp";
import { meetingJoinState } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { formatClassHours } from "@/lib/format-class-when";
import { mdButton, mdFab } from "@/lib/material/material-classes";
import type { ClassDetailView } from "@/services/classes/classes.types";

interface ClassJoinSideProps {
  classDetail: ClassDetailView;
}

/**
 * The top of the class's side column, in the new design system (2026-10-23,
 * «M4» of the owner's canvas): its main action as Material's extended FAB.
 * Before the class, «Entrar a la clase» while the link is open («Volver a
 * entrar» once it ended), with the room and the countdown under it; before
 * the link opens, when it does; without a link, that the staff will add it
 * and «Escríbenos». After it, whether the student came and «Ver la
 * grabación». A cancelled class says nothing here: the panel says why. The
 * link never travels ahead of time: the countdown asks for the page again
 * at the instant it opens, as `MeetingJoinCard`'s does.
 */
export function ClassJoinSide({ classDetail }: ClassJoinSideProps) {
  if (classDetail.cancelled) return null;

  if (classDetail.view === "review") {
    return (
      <div className="class-notebook__join">
        {classDetail.recordingUrl && (
          <a
            href={classDetail.recordingUrl}
            target="_blank"
            rel="noreferrer"
            className={`${mdFab("primary")} class-notebook__fab`}
          >
            <CirclePlayIcon variant="classic-solid" className="platform-md-icon" />
            Ver la grabación
            <span className="class-notebook__sr">(se abre en una pestaña nueva)</span>
          </a>
        )}
        {classDetail.attended === true && (
          <p className="class-notebook__attendance class-notebook__attendance_tone_success">
            <UserCheckIcon variant="classic-solid" className="class-notebook__attendance-icon" />
            Asististe
          </p>
        )}
        {classDetail.attended === false && (
          <p className="class-notebook__attendance class-notebook__attendance_tone_warning">
            <UserXmarkIcon variant="classic-solid" className="class-notebook__attendance-icon" />
            No asististe
          </p>
        )}
      </div>
    );
  }

  const { join } = classDetail;
  const state = meetingJoinState(join);
  const entering = join.meetingUrl !== null && (state === "open" || state === "live" || state === "tail");
  const hour = (iso: string) => formatClassHours(new Date(iso), 0, join.timeZone).split("–")[0] ?? "";
  const room = join.providerLabel ? `${join.providerLabel} · ` : "";
  const countdown = (
    <MeetingCountdown
      startIso={join.startIso}
      endIso={join.endIso}
      visibleFromIso={join.visibleFromIso}
      untilIso={join.untilIso}
      hasLink={join.meetingUrl !== null}
      nowIso={join.nowIso}
      timeZone={join.timeZone}
    />
  );

  return (
    <div className="class-notebook__join">
      {entering && join.meetingUrl && (
        <a
          href={join.meetingUrl}
          target="_blank"
          rel="noreferrer"
          className={`${mdFab("primary")} class-notebook__fab`}
        >
          <CirclePlayIcon variant="classic-solid" className="platform-md-icon" />
          {state === "tail" ? "Volver a entrar" : "Entrar a la clase"}
          <span className="class-notebook__sr">(se abre en una pestaña nueva)</span>
        </a>
      )}
      {entering && (
        <p className="class-notebook__join-line">
          {room}
          {countdown}
        </p>
      )}
      {state === "waiting" && join.visibleFromIso && (
        <p className="class-notebook__join-line">
          {room}el enlace se abre a las {hour(join.visibleFromIso)} · {countdown}
        </p>
      )}
      {state === "none" && (
        <>
          <p className="class-notebook__join-line">
            El enlace todavía no está. Administración lo agregará antes de la clase.
          </p>
          {join.whatsappHref && (
            <a
              href={join.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className={`${mdButton("text", "sm")} class-notebook__join-ask`}
            >
              <WhatsappIcon className="platform-md-icon" />
              Escríbenos
              <span className="class-notebook__sr">(se abre en una pestaña nueva)</span>
            </a>
          )}
        </>
      )}
      {state === "closed" && <p className="class-notebook__join-line">La clase terminó a las {hour(join.endIso)}.</p>}
    </div>
  );
}
