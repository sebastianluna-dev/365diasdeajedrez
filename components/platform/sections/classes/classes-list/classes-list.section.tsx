import Link from "next/link";
import { CalendarClockIcon } from "@/components/icons/calendar-clock-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { PaidClassesCard } from "@/components/platform/shared/paid-classes-card/paid-classes-card.comp";
import { PastClassCard } from "@/components/platform/shared/past-class-card/past-class-card.comp";
import { PlatformSideNav } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { classDayParts, formatAgendaDay } from "@/lib/format-class-when";
import { mdButton } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";
import { dayKeyIn } from "@/lib/timezone";
import type { ClassCardData, StudentClassesView } from "@/services/classes/classes.types";
import { agendaClass } from "./agenda-class";
import { AgendaRow } from "./agenda-row.comp";
import { TodayClass } from "./today-class.comp";
import "./classes-list.section.css";

export type ClassesTab = "proximas" | "pasadas";

interface ClassesListSectionProps {
  view: StudentClassesView;
  tab: ClassesTab;
  /** How many pages of past classes are shown; «Ver más» asks for one more. */
  pastPages: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** «Hoy» and «jueves 22 de octubre», «Domingo 25 de octubre» and «en 3 días»: a day's heading and its aside. */
function dayHeading(dayKey: string, todayKey: string): { label: string; aside: string | null } {
  const days = Math.round((Date.parse(`${dayKey}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / DAY_MS);
  const [first = "", ...rest] = formatAgendaDay(dayKey, todayKey).split(" · ");
  const distance = days > 1 ? `en ${days} días` : null;
  return { label: first, aside: rest.length > 0 ? rest.join(" · ") : distance };
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
 * «Mis clases» (ALU-1) in the new design system (2026-10-23, «M4» of the
 * owner's canvas): a workspace whose side column has the two views as links
 * with their counts — «Próximas» and «Pasadas» — and under them «Tus clases
 * pagadas» in counts; and whose panel is the view. «Próximas» is the agenda
 * by day: today's class as a large band with the way in, a later one as a
 * row, and at the foot the classes paid without a date as one amber notice.
 * «Pasadas» is the months, newest first, each class beside its day as its
 * card, the board of its material when it has one, ten at a time. Nothing
 * says which payment a class belongs to.
 */
export function ClassesListSection({ view, tab, pastPages }: ClassesListSectionProps) {
  const ahead = [...view.today, ...view.upcoming];
  const todayKey = dayKeyIn(new Date(view.nowIso), view.timeZone);
  const { whatsappHref } = view;
  const nothing = ahead.length === 0 && view.toSchedule === 0 && view.pastTotal === 0;

  return (
    <div className="platform-workspace classes-list">
      <div className="platform-workspace__side classes-list__side">
        <PlatformSideNav
          label="Vistas de mis clases"
          groups={[
            {
              links: [
                {
                  label: "Próximas",
                  href: platformRoutes.classes,
                  count: ahead.length,
                  icon: "calendar",
                  current: tab === "proximas",
                },
                {
                  label: "Pasadas",
                  href: `${platformRoutes.classes}?vista=pasadas`,
                  count: view.pastTotal,
                  icon: "rotate-left",
                  current: tab === "pasadas",
                },
              ],
            },
          ]}
        />
        <PaidClassesCard balance={view.balance} whatsappHref={whatsappHref} />
      </div>

      <section className="platform-workspace__panel classes-list__panel" aria-labelledby="mis-clases">
        <h1 id="mis-clases" className="classes-list__sr">
          Mis clases · {tab === "proximas" ? "Próximas" : "Pasadas"}
        </h1>
        {nothing ? (
          <EmptyClasses whatsappHref={whatsappHref} />
        ) : tab === "proximas" ? (
          <Upcoming view={view} ahead={ahead} todayKey={todayKey} whatsappHref={whatsappHref} />
        ) : (
          <Past view={view} pastPages={pastPages} />
        )}
      </section>
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
    <>
      {ahead.length === 0 && (
        <p className="classes-list__quiet">
          No tienes más clases programadas. Cuando administración programe una contigo, aparecerá aquí.
        </p>
      )}
      {byDay(ahead, view.timeZone).map(([key, cards]) => {
        const heading = dayHeading(key, todayKey);
        return (
          <section key={key} className="classes-list__day" aria-labelledby={`dia-${key}`}>
            <h2 id={`dia-${key}`} className="classes-list__day-title">
              {heading.label}
              {heading.aside && <span className="classes-list__day-aside"> {heading.aside}</span>}
            </h2>
            {cards.map((card) => {
              const agenda = agendaClass(card);
              return (agenda.isToday && !card.cancelled) || agenda.entering ? (
                <TodayClass
                  key={card.id}
                  card={card}
                  withJoinBar={view.joinOpen !== null && card.join?.startIso === view.joinOpen.startIso}
                />
              ) : (
                <AgendaRow key={card.id} card={card} />
              );
            })}
          </section>
        );
      })}
      {view.toSchedule > 0 && (
        <section className="classes-list__undated" aria-label="Sin fecha">
          <CalendarClockIcon variant="duotone-light" className="classes-list__undated-icon" />
          <p className="classes-list__undated-text">
            Tienes {plural(view.toSchedule, "clase pagada", "clases pagadas")} sin fecha. Administración te escribirá
            para {view.toSchedule === 1 ? "fijarla" : "fijarlas"}.
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className={`${mdButton("text", "sm")} classes-list__undated-link`}
          >
            <WhatsappIcon className="platform-md-icon" />
            Escríbenos
            <span className="classes-list__sr"> (se abre en una pestaña nueva)</span>
          </a>
        </section>
      )}
    </>
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
      {view.past.map((month) => (
        <section key={month.key} className="classes-list__day" aria-labelledby={`mes-${month.key}`}>
          <h2 id={`mes-${month.key}`} className="classes-list__day-title">
            {month.label}
            <span className="classes-list__day-aside"> {plural(month.cards.length, "clase", "clases")}</span>
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
        </section>
      ))}
      {view.pastShown < view.pastTotal && (
        <p className="classes-list__more">
          <Link
            href={`${platformRoutes.classes}?vista=pasadas&pagina=${pastPages + 1}`}
            className={mdButton("outlined", "sm")}
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

/** No class ever and none paid: a dashed box with the faint ghost of a class, and the way to ask. */
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
      <a href={whatsappHref} target="_blank" rel="noreferrer" className={mdButton("tonal", "sm")}>
        <WhatsappIcon className="platform-md-icon" />
        ¿Quieres tomar clases? Escríbenos
        <span className="classes-list__sr"> (se abre en una pestaña nueva)</span>
      </a>
    </div>
  );
}
