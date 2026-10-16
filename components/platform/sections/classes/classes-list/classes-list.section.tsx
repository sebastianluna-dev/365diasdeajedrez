import Link from "next/link";
import { CalendarClockIcon } from "@/components/icons/calendar-clock-icon.comp";
import { CalendarDaysIcon } from "@/components/icons/calendar-days-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ClockRotateLeftIcon } from "@/components/icons/clock-rotate-left-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { ClassTicket } from "@/components/platform/shared/class-ticket/class-ticket.comp";
import { PaidClassesCard } from "@/components/platform/shared/paid-classes-card/paid-classes-card.comp";
import { PastClassCard } from "@/components/platform/shared/past-class-card/past-class-card.comp";
import { classDayParts, formatAgendaDay } from "@/lib/format-class-when";
import { platformRoutes } from "@/lib/platform-routes";
import { dayKeyIn } from "@/lib/timezone";
import type { ClassCardData, StudentClassesView } from "@/services/classes/classes.types";
import "./classes-list.section.css";

export type ClassesTab = "proximas" | "pasadas";

interface ClassesListSectionProps {
  view: StudentClassesView;
  tab: ClassesTab;
  /** How many pages of past classes are shown; «Ver más» asks for one more. */
  pastPages: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** «Domingo 18 de octubre · en 3 días»: the agenda's heading, with how far the day is past tomorrow. */
function dayHeading(dayKey: string, todayKey: string): { label: string; distance: string | null } {
  const days = Math.round((Date.parse(`${dayKey}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / DAY_MS);
  return { label: formatAgendaDay(dayKey, todayKey), distance: days > 1 ? `en ${days} días` : null };
}

function byDay(cards: readonly ClassCardData[], timeZone: string): [string, ClassCardData[]][] {
  const days = new Map<string, ClassCardData[]>();
  for (const card of cards) {
    const key = dayKeyIn(new Date(card.startIso), timeZone);
    days.set(key, [...(days.get(key) ?? []), card]);
  }
  return [...days.entries()];
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * «Mis clases» (ALU-1): two tabs with their counts. «Próximas» is the agenda
 * by day, each class a ticket — today's tinted, the one whose link is open
 * with «Entrar a la clase» —, and under it the classes paid without a date
 * as one notice. «Pasadas» is a line with a stop per month, the day on the
 * left and each class as its card, the board of its material when it has
 * one, ten at a time. The lane beside both is «Tus clases pagadas», in
 * counts. Nothing says which payment a class belongs to.
 */
export function ClassesListSection({ view, tab, pastPages }: ClassesListSectionProps) {
  const ahead = [...view.today, ...view.upcoming];
  const todayKey = dayKeyIn(new Date(view.nowIso), view.timeZone);
  const { whatsappHref } = view;
  const nothing = ahead.length === 0 && view.toSchedule === 0 && view.pastTotal === 0;

  return (
    <div className="classes-list">
      <nav className="classes-list__tabs" aria-label="Vistas de mis clases">
        <Link
          href={platformRoutes.classes}
          className={`classes-list__tab${tab === "proximas" ? " classes-list__tab_state_active" : ""}`}
          aria-current={tab === "proximas" ? "page" : undefined}
        >
          <CalendarDaysIcon variant="classic-solid" className="classes-list__tab-icon" />
          Próximas
          <span className="classes-list__tab-count">{ahead.length}</span>
          <span className="classes-list__sr"> clases</span>
        </Link>
        <Link
          href={`${platformRoutes.classes}?vista=pasadas`}
          className={`classes-list__tab${tab === "pasadas" ? " classes-list__tab_state_active" : ""}`}
          aria-current={tab === "pasadas" ? "page" : undefined}
        >
          <ClockRotateLeftIcon variant="classic-solid" className="classes-list__tab-icon" />
          Pasadas
          <span className="classes-list__tab-count">{view.pastTotal}</span>
          <span className="classes-list__sr"> clases</span>
        </Link>
      </nav>

      <div className="classes-list__columns">
        <div className="classes-list__main">
          {nothing ? (
            <EmptyClasses whatsappHref={whatsappHref} />
          ) : tab === "proximas" ? (
            <Upcoming view={view} ahead={ahead} todayKey={todayKey} whatsappHref={whatsappHref} />
          ) : (
            <Past view={view} pastPages={pastPages} />
          )}
        </div>
        <aside className="classes-list__lane" aria-label="Tus clases pagadas">
          <PaidClassesCard balance={view.balance} whatsappHref={whatsappHref} />
        </aside>
      </div>
    </div>
  );
}

interface UpcomingProps {
  view: StudentClassesView;
  ahead: ClassCardData[];
  todayKey: string;
  whatsappHref: string;
}

function Upcoming({ view, ahead, todayKey, whatsappHref }: UpcomingProps) {
  return (
    <div className="classes-list__agenda">
      {ahead.length === 0 && (
        <p className="classes-list__quiet">
          No tienes más clases programadas. Cuando administración programe una contigo, aparecerá aquí.
        </p>
      )}
      {byDay(ahead, view.timeZone).map(([key, cards]) => {
        const heading = dayHeading(key, todayKey);
        const [first, ...rest] = heading.label.split(" · ");
        return (
          <section key={key} className="classes-list__day" aria-labelledby={`dia-${key}`}>
            <h2 id={`dia-${key}`} className="classes-list__day-title">
              <span>
                {key === todayKey ? <span className="classes-list__today">{first}</span> : first}
                {rest.length > 0 && ` · ${rest.join(" · ")}`}
                {heading.distance && <span className="classes-list__distance"> · {heading.distance}</span>}
              </span>
            </h2>
            {cards.map((card) => (
              <ClassTicket
                key={card.id}
                card={card}
                withJoinBar={view.joinOpen !== null && card.join?.startIso === view.joinOpen.startIso}
              />
            ))}
          </section>
        );
      })}
      {view.toSchedule > 0 && (
        <section className="classes-list__day" aria-labelledby="sin-fecha">
          <h2 id="sin-fecha" className="classes-list__day-title">
            <span>Sin fecha</span>
          </h2>
          <div className="classes-list__notice">
            <span className="classes-list__notice-icon" aria-hidden="true">
              <CalendarClockIcon variant="classic-solid" className="classes-list__notice-glyph" />
            </span>
            <p className="classes-list__notice-text">
              <b className="classes-list__notice-lead">
                Tienes {plural(view.toSchedule, "clase pagada", "clases pagadas")} sin fecha.
              </b>{" "}
              Administración te escribirá para {view.toSchedule === 1 ? "fijarla" : "fijarlas"}.
            </p>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="classes-list__notice-link">
              <WhatsappIcon className="classes-list__notice-link-icon" />
              Escríbenos
              <span className="classes-list__sr"> (se abre en una pestaña nueva)</span>
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

interface PastProps {
  view: StudentClassesView;
  pastPages: number;
}

function Past({ view, pastPages }: PastProps) {
  if (view.past.length === 0) {
    return <p className="classes-list__quiet">Todavía no tienes clases pasadas. Aquí quedará cada una al terminar.</p>;
  }
  return (
    <>
      <ol className="classes-list__timeline" aria-label="Tus clases pasadas, de la más reciente a la más antigua">
        {view.past.map((month) => (
          <li key={month.key} className="classes-list__month">
            <span className="classes-list__stop" aria-hidden="true">
              <CheckIcon variant="classic-solid" className="classes-list__stop-icon" />
            </span>
            <h2 className="classes-list__month-title">
              <span>
                {month.label}
                <span className="classes-list__distance"> · {plural(month.cards.length, "clase", "clases")}</span>
              </span>
            </h2>
            {month.cards.map((card) => {
              const parts = classDayParts(new Date(card.startIso), view.timeZone);
              return (
                <div key={card.id} className="classes-list__entry">
                  <p className="classes-list__when" aria-hidden="true">
                    <span className="classes-list__when-day">{parts.day}</span>
                    <span className="classes-list__when-weekday">{parts.weekday}</span>
                  </p>
                  <PastClassCard card={card} />
                </div>
              );
            })}
          </li>
        ))}
      </ol>
      {view.pastShown < view.pastTotal && (
        <p className="classes-list__more">
          <Link
            href={`${platformRoutes.classes}?vista=pasadas&pagina=${pastPages + 1}`}
            className="platform-button"
            scroll={false}
          >
            Ver más
          </Link>
          <span className="classes-list__more-count">
            {view.pastShown} de {view.pastTotal}
          </span>
        </p>
      )}
    </>
  );
}

/** No class ever and none paid: a dashed box with the faint ghost of a ticket, and the way to ask. */
function EmptyClasses({ whatsappHref }: { whatsappHref: string }) {
  return (
    <div className="classes-list__empty">
      <div className="classes-list__ghost" aria-hidden="true">
        <span className="classes-list__ghost-stub" />
        <span className="classes-list__ghost-lines">
          <span className="classes-list__ghost-line classes-list__ghost-line_size_short" />
          <span className="classes-list__ghost-line" />
          <span className="classes-list__ghost-line classes-list__ghost-line_size_mid" />
        </span>
      </div>
      <p className="classes-list__empty-title">No tienes clases programadas</p>
      <p className="classes-list__empty-text">
        Cuando administración programe una clase contigo, aparecerá aquí con su fecha y su enlace.
      </p>
      <a href={whatsappHref} target="_blank" rel="noreferrer" className="classes-list__empty-link">
        <WhatsappIcon className="classes-list__notice-link-icon" />
        ¿Quieres tomar clases? Escríbenos
        <span className="classes-list__sr"> (se abre en una pestaña nueva)</span>
      </a>
    </div>
  );
}
