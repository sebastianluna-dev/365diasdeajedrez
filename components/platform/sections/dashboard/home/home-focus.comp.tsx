import Link from "next/link";
import { useId } from "react";
import { CirclePlayIcon } from "@/components/icons/circle-play-icon.comp";
import { meetingJoinState } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { formatClassDay, formatClassHours } from "@/lib/format-class-when";
import { mdButton } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";
import { dayKeyIn } from "@/lib/timezone";
import { joinSpanish } from "@/services/shared/class-rules";
import type { ClassCardData } from "@/services/classes/classes.types";
import { HomeClassLead } from "./home-class-lead.comp";
import { HomeClassRing } from "./home-class-ring.comp";
import type { HomeFocus as HomeFocusData } from "./home-plan";
import "./home-focus.comp.css";

const DAY_MS = 24 * 60 * 60 * 1000;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** «Hoy a las 18:00 · con Laura Méndez · grupal, con Ana, Diego y Mateo». */
function classLine(card: ClassCardData, startHour: string): string {
  const start = new Date(card.startIso);
  const now = new Date(card.nowIso);
  const key = dayKeyIn(start, card.timeZone);
  const day =
    key === dayKeyIn(now, card.timeZone)
      ? "Hoy"
      : key === dayKeyIn(new Date(now.getTime() + DAY_MS), card.timeZone)
        ? "Mañana"
        : capitalize(formatClassDay(start, card.timeZone, now));
  const group = card.isGroup
    ? ` · grupal${card.classmates.length > 0 ? `, con ${joinSpanish(card.classmates)}` : ""}`
    : "";
  return `${day} a las ${startHour} · con ${card.teacherName}${group}`;
}

interface HomeFocusProps {
  focus: HomeFocusData;
}

/**
 * «Lo siguiente», the one thing the home page puts first (the owner's «Inicio:
 * un solo foco», 2026-10-23): a block of the primary, the brightest thing on
 * the panel, with what it is, its name, one line about it and its way in.
 *
 * - **A class**: today's says how long until it starts in words that follow
 *   the clock (`HomeClassLead`) and, in its last hour, the ring of the
 *   minutes left (`HomeClassRing`); «Entrar a la clase» while the link is
 *   open, and «Ver la clase». A class of another day says only when.
 * - **The course in progress**: where the student left it and «Continuar».
 * - **Nothing yet**: choosing what to study, «Ver el catálogo».
 *
 * Material's buttons are drawn inverted inside it — the filled one white with
 * the primary's ink, the text one in white —, by pointing the roles they read
 * at the block's own colours.
 */
export function HomeFocus({ focus }: HomeFocusProps) {
  const titleId = useId();

  if (focus.kind === "class") {
    const { card } = focus;
    const [startHour = ""] = formatClassHours(new Date(card.startIso), card.durationMin, card.timeZone).split("–");
    const join = card.cancelled ? null : card.join;
    const state = join ? meetingJoinState(join) : "closed";
    const entering =
      join !== null && join.meetingUrl !== null && (state === "open" || state === "live" || state === "tail");

    return (
      <section className="home-focus" aria-labelledby={titleId}>
        <div className="home-focus__body">
          <p className="home-focus__lead">
            Lo siguiente ·{" "}
            {focus.isToday && join ? <HomeClassLead join={join} startHour={startHour} /> : "tu próxima clase"}
          </p>
          <h2 id={titleId} className="home-focus__title">
            {card.title}
          </h2>
          <p className="home-focus__line">{classLine(card, startHour)}</p>
          {focus.isToday && state === "none" && (
            <p className="home-focus__note">Administración agregará el enlace antes de la clase.</p>
          )}
          <div className="home-focus__actions">
            {entering && join?.meetingUrl ? (
              <>
                <a href={join.meetingUrl} target="_blank" rel="noreferrer" className={mdButton("filled", "md")}>
                  <CirclePlayIcon variant="classic-solid" className="platform-md-icon" />
                  {state === "tail" ? "Volver a entrar" : "Entrar a la clase"}
                  <span className="home-focus__sr">(se abre en una pestaña nueva)</span>
                </a>
                <Link href={card.href} className={mdButton("text", "md")}>
                  Ver la clase
                </Link>
              </>
            ) : (
              <Link href={card.href} className={mdButton("filled", "md")}>
                Ver la clase
              </Link>
            )}
          </div>
        </div>
        {focus.isToday && join && <HomeClassRing startIso={join.startIso} nowIso={join.nowIso} />}
      </section>
    );
  }

  if (focus.kind === "course") {
    const { course } = focus;
    return (
      <section className="home-focus" aria-labelledby={titleId}>
        <div className="home-focus__body">
          <p className="home-focus__lead">Lo siguiente · tu curso</p>
          <h2 id={titleId} className="home-focus__title">
            {course.courseName}
          </h2>
          <p className="home-focus__line">
            Te quedaste en: {course.lessonName} · {course.completedLessons} de {course.totalLessons} lecciones
          </p>
          <div className="home-focus__actions">
            <Link href={course.href} className={mdButton("filled", "md")}>
              <CirclePlayIcon variant="classic-solid" className="platform-md-icon" />
              Continuar
            </Link>
            <Link href={platformRoutes.courses} className={mdButton("text", "md")}>
              Ver mis cursos
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="home-focus" aria-labelledby={titleId}>
      <div className="home-focus__body">
        <p className="home-focus__lead">Lo siguiente</p>
        <h2 id={titleId} className="home-focus__title">
          Elige qué estudiar
        </h2>
        <p className="home-focus__line">Empieza uno de tus cursos, o agrega uno del catálogo.</p>
        <div className="home-focus__actions">
          <Link href={platformRoutes.courseCatalog} className={mdButton("filled", "md")}>
            Ver el catálogo
          </Link>
          <Link href={platformRoutes.courses} className={mdButton("text", "md")}>
            Ver mis cursos
          </Link>
        </div>
      </div>
    </section>
  );
}
