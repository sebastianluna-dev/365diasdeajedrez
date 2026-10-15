import { VideoIcon } from "@/components/icons/video-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { CopyLinkButton } from "@/components/platform/shared/copy-link-button/copy-link-button.comp";
import { MeetingCountdown } from "@/components/platform/shared/meeting-countdown/meeting-countdown.comp";
import { CLASS_PHASE } from "@/constants/platform/class-codes.const";
import { formatClassHours } from "@/lib/format-class-when";
import type { MeetingJoinData } from "./meeting-join-card.types";
import "./meeting-join-card.comp.css";

export interface MeetingJoinCardProps extends MeetingJoinData {
  audience: "student" | "teacher" | "staff";
  /** `full`: the card of a class page; `compact`: a lane's row; `bar`: the fixed bar on a phone. */
  density?: "full" | "compact" | "bar";
}

/** What the card is in: the link to come, open, the class running, its tail, or over. */
export function meetingJoinState(
  data: Pick<
    MeetingJoinData,
    "phase" | "hasLink" | "meetingUrl" | "startIso" | "endIso" | "visibleFromIso" | "untilIso" | "nowIso"
  >,
): "none" | "waiting" | "open" | "live" | "tail" | "closed" {
  if (data.phase === CLASS_PHASE.CANCELLED) return "closed";
  const now = Date.parse(data.nowIso);
  if (data.untilIso && now >= Date.parse(data.untilIso)) return "closed";
  if (data.phase === CLASS_PHASE.DONE && !(data.untilIso && now < Date.parse(data.untilIso))) return "closed";
  if (!data.hasLink) return now >= Date.parse(data.endIso) ? "closed" : "none";
  if (data.visibleFromIso && now < Date.parse(data.visibleFromIso)) return "waiting";
  if (now >= Date.parse(data.endIso)) return "tail";
  if (now >= Date.parse(data.startIso)) return "live";
  return "open";
}

/**
 * How a class is joined, for whoever reads it: «Entrar a la clase» while the
 * link is open — from half an hour before until half an hour after the end,
 * «Volver a entrar» once it ended —, the countdown beside it, the link to
 * copy; before the link opens, when it opens; without a link, that the staff
 * will add it, and «Escríbenos». The link never travels ahead of time: the
 * server hands it over, and the countdown asks for the page again at the
 * instant it opens. The staff only copies. A Server Component; the ticking
 * is `MeetingCountdown`'s.
 */
export function MeetingJoinCard({ audience, density = "full", ...data }: MeetingJoinCardProps) {
  const state = meetingJoinState(data);
  const opensAt = data.visibleFromIso
    ? (formatClassHours(new Date(data.visibleFromIso), 0, data.timeZone).split("–")[0] ?? "")
    : "";
  const endHour = formatClassHours(new Date(data.endIso), 0, data.timeZone).split("–")[0] ?? "";
  const countdown = (
    <MeetingCountdown
      startIso={data.startIso}
      endIso={data.endIso}
      visibleFromIso={data.visibleFromIso}
      untilIso={data.untilIso}
      hasLink={data.meetingUrl !== null}
      nowIso={data.nowIso}
      timeZone={data.timeZone}
    />
  );
  const buttonClass =
    density === "full"
      ? "platform-button platform-button_variant_accent platform-button_size_lg"
      : density === "bar"
        ? "platform-button platform-button_variant_accent"
        : "platform-button platform-button_size_sm";

  return (
    <div className={`meeting-join meeting-join_density_${density} meeting-join_state_${state}`}>
      {(state === "open" || state === "live" || state === "tail") && data.meetingUrl && audience !== "staff" && (
        <a href={data.meetingUrl} target="_blank" rel="noreferrer" className={`${buttonClass} meeting-join__enter`}>
          <VideoIcon variant="classic-solid" className="platform-button__icon" />
          {state === "tail" ? "Volver a entrar" : "Entrar a la clase"}
          <span className="meeting-join__sr">(se abre en una pestaña nueva)</span>
        </a>
      )}
      <div className="meeting-join__text">
        {state === "none" && (
          <>
            <p className="meeting-join__line">
              El enlace todavía no está. Administración lo agregará antes de la clase.
            </p>
            {data.whatsappHref && audience !== "staff" && (
              <a href={data.whatsappHref} target="_blank" rel="noreferrer" className="meeting-join__whatsapp">
                <WhatsappIcon className="meeting-join__whatsapp-icon" />
                Escríbenos
                <span className="meeting-join__sr">(se abre en una pestaña nueva)</span>
              </a>
            )}
          </>
        )}
        {state === "waiting" && (
          <p className="meeting-join__line">
            {data.providerLabel ? `${data.providerLabel} · ` : ""}el enlace se abre a las {opensAt} · {countdown}
          </p>
        )}
        {(state === "open" || state === "live" || state === "tail") && (
          <p className="meeting-join__line">
            {data.providerLabel ? `${data.providerLabel} · ` : ""}
            {audience === "staff" && data.meetingUrl ? `${data.meetingUrl.replace(/^https?:\/\//, "")} · ` : ""}
            {countdown}
          </p>
        )}
        {state === "closed" && <p className="meeting-join__line">La clase terminó a las {endHour}.</p>}
        {data.meetingUrl && state !== "closed" && state !== "none" && density !== "bar" && (
          <CopyLinkButton url={data.meetingUrl} label="Copiar el enlace" />
        )}
      </div>
    </div>
  );
}
