"use client";

import Link from "next/link";
import { Popover } from "radix-ui";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactElement,
} from "react";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { VideoIcon } from "@/components/icons/video-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import type { ClassRowData } from "@/components/platform/shared/class-row/class-row.types";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { CLASS_PHASE, type ClassPhaseCode } from "@/constants/platform/class-codes.const";
import {
  clock,
  dayLong,
  daysOf,
  placeInLanes,
  startOfMonth,
  stepDay,
  viewTitle,
  weekdayIndex,
  weekdayShort,
  zonedMoment,
  type CalendarView,
  type PlainDay,
} from "./class-calendar.dates";
import { PlatformHeaderContext } from "@/components/platform/sections/shell/platform-header-context.comp";
import { ClassCalendarToolbar } from "./class-calendar-toolbar.comp";
import "./class-calendar.comp.css";

/** A class as the calendar draws it: the same fields «Clases que imparto» lists it by, and its call. */
export type CalendarClass = Pick<
  ClassRowData,
  "id" | "href" | "title" | "phase" | "startIso" | "durationMin" | "people"
> & {
  /** The call, offered as «Entrar a la clase» on its card while the link is open or the class is live. */
  meetingUrl?: string;
};

interface ClassCalendarProps {
  classes: CalendarClass[];
  /** The teacher's zone: the calendar's days and hours are its. */
  timeZone: string;
  nowIso: string;
  /** Default `week`, or `day` on a phone. */
  defaultView?: CalendarView;
  /** The day it opens on; today by default. */
  defaultDay?: PlainDay;
}

/** Each phase's word, as the teacher reads it (`ClassStatusTag`), for the legend and the accessible names. */
const PHASE_WORDS: Record<ClassPhaseCode, string> = {
  [CLASS_PHASE.UPCOMING]: "Programada",
  [CLASS_PHASE.OPEN]: "Enlace abierto",
  [CLASS_PHASE.IN_PROGRESS]: "En vivo",
  [CLASS_PHASE.AWAITING_CLOSE]: "Por finalizar",
  [CLASS_PHASE.DONE]: "Finalizada",
  [CLASS_PHASE.CANCELLED]: "Cancelada",
};

const MINUTES_IN_DAY = 24 * 60;
/** The hour the day and week views open on when today is not in sight. */
const MORNING_HOUR = 7;
/** How many classes a month's day lists before «+N más». */
const MONTH_CHIPS = 3;
/** The phases whose card leads into the call. */
const JOINABLE: ClassPhaseCode[] = [CLASS_PHASE.OPEN, CLASS_PHASE.IN_PROGRESS];

const PHONE = "(width < 640px)";

function subscribeToPhone(onChange: () => void) {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** A phone has no room for seven columns: it opens on the day, as Google Calendar does. The server draws the week. */
function isPhoneNow(): boolean {
  return window.matchMedia(PHONE).matches;
}

/** A block under an hour shows its title and hours on one line; from an hour and a half on, who is in it too. */
type BlockSize = "short" | "regular" | "long";

function blockSize(minutes: number): BlockSize {
  if (minutes < 60) return "short";
  return minutes >= 90 ? "long" : "regular";
}

interface DayClass {
  item: CalendarClass;
  day: PlainDay;
  start: number;
  end: number;
}

/** «class-calendar__event_phase_in-progress»: the element's colours for the phase. */
function phaseModifier(element: "event" | "chip" | "swatch", phase: ClassPhaseCode): string {
  return `class-calendar__${element}_phase_${phase.toLowerCase().replace("_", "-")}`;
}

/** «GMT-6»: the zone the hours are in, beside them as Google Calendar writes it. */
function zoneLabel(timeZone: string, iso: string): string {
  return (
    new Intl.DateTimeFormat("es-MX", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(new Date(iso))
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  );
}

/**
 * The teacher's classes on a calendar, the way Google Calendar shows a
 * diary: a day, a week or a month, «Hoy» and the arrows to move, a small
 * month at the side to jump to a day, and each class a block set by its
 * hours and coloured by its phase, which opens a card with its time, who is
 * in it and the way to its record. Classes that overlap share their hour
 * side by side; the red line is now. Every day and hour is the teacher's
 * zone, whatever the browser's.
 *
 * Front-only (2026-10-19): it is given its classes and stores nothing.
 */
export function ClassCalendar({ classes, timeZone, nowIso, defaultView, defaultDay }: ClassCalendarProps) {
  const now = zonedMoment(nowIso, timeZone);
  const isPhone = useSyncExternalStore(subscribeToPhone, isPhoneNow, () => false);
  // The view chosen in the toolbar; until then the one asked for, or the phone's day.
  const [chosenView, setView] = useState<CalendarView | null>(null);
  const view = chosenView ?? defaultView ?? (isPhone ? "day" : "week");
  const [day, setDay] = useState<PlainDay>(defaultDay ?? now.day);
  const [miniMonth, setMiniMonth] = useState<PlainDay>(startOfMonth(defaultDay ?? now.day));
  const scrollRef = useRef<HTMLDivElement>(null);
  const legendId = useId();

  const byDay = useMemo(() => {
    const map = new Map<PlainDay, DayClass[]>();
    for (const item of classes) {
      const start = zonedMoment(item.startIso, timeZone);
      const entry = {
        item,
        day: start.day,
        start: start.minute,
        end: Math.min(MINUTES_IN_DAY, start.minute + item.durationMin),
      };
      map.set(start.day, [...(map.get(start.day) ?? []), entry]);
    }
    for (const list of map.values()) list.sort((a, b) => a.start - b.start);
    return map;
  }, [classes, timeZone]);

  const days = daysOf(view, day);
  const inView = view === "month" ? [] : days;
  const showsToday = view !== "month" && days.includes(now.day);

  // The day and week views open where the day is: an hour before now when today is in sight, the morning otherwise.
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const hour = showsToday ? Math.max(0, now.minute / 60 - 1.5) : MORNING_HOUR;
    scroller.scrollTop = hour * (scroller.scrollHeight / 24);
  }, [view, day, showsToday, now.minute]);

  const goTo = (target: PlainDay) => {
    setDay(target);
    setMiniMonth(startOfMonth(target));
  };
  const openDay = (target: PlainDay) => {
    goTo(target);
    setView("day");
  };

  return (
    <div className="class-calendar">
      <PlatformHeaderContext inlineClassName="class-calendar__toolbar-row">
        <ClassCalendarToolbar
          view={view}
          title={viewTitle(view, day)}
          onToday={() => goTo(now.day)}
          onStep={(direction) => goTo(stepDay(view, day, direction))}
          onView={setView}
        />
      </PlatformHeaderContext>

      <div className="class-calendar__body">
        <aside className="class-calendar__side" aria-label="Elegir un día">
          <MiniMonth
            month={miniMonth}
            selected={day}
            today={now.day}
            inView={inView}
            hasClasses={(target) => byDay.has(target)}
            onMonth={setMiniMonth}
            onPick={goTo}
          />
          <h3 className="class-calendar__legend-title" id={legendId}>
            Estados
          </h3>
          <ul className="class-calendar__legend" aria-labelledby={legendId}>
            {Object.values(CLASS_PHASE).map((phase) => (
              <li key={phase} className="class-calendar__legend-item">
                <span className={`class-calendar__swatch ${phaseModifier("swatch", phase)}`} aria-hidden="true" />
                {PHASE_WORDS[phase]}
              </li>
            ))}
          </ul>
        </aside>

        <div className="class-calendar__main">
          {view === "month" ? (
            <MonthGrid days={days} month={day.slice(0, 7)} today={now.day} byDay={byDay} onOpenDay={openDay} />
          ) : (
            <div className={`class-calendar__grid class-calendar__grid_view_${view}`}>
              <div className="class-calendar__heads">
                <span className="class-calendar__zone">{zoneLabel(timeZone, nowIso)}</span>
                {days.map((target) => (
                  <button
                    key={target}
                    type="button"
                    className={`class-calendar__head${target === now.day ? " class-calendar__head_state_today" : ""}`}
                    aria-label={`Ver el ${dayLong(target)}`}
                    onClick={() => openDay(target)}
                  >
                    <span className="class-calendar__head-weekday">{weekdayShort(target)}</span>
                    <span className="class-calendar__head-date">{Number(target.slice(8))}</span>
                  </button>
                ))}
              </div>
              <div
                className="class-calendar__scroll"
                ref={scrollRef}
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a box that scrolls is reached by the keyboard to be scrolled, even on a day without classes
                tabIndex={0}
                role="region"
                aria-label="Horas"
              >
                <div className="class-calendar__hours" aria-hidden="true">
                  {Array.from({ length: 23 }, (_, index) => (
                    <span
                      key={index}
                      className="class-calendar__hour"
                      style={{ top: `calc(${index + 1} * var(--hour))` }}
                    >
                      {clock((index + 1) * 60)}
                    </span>
                  ))}
                </div>
                {days.map((target) => (
                  <div
                    key={target}
                    className={`class-calendar__column${weekdayIndex(target) > 4 ? " class-calendar__column_day_weekend" : ""}`}
                  >
                    {placeInLanes(byDay.get(target) ?? []).map((placed) => (
                      <CalendarEvent
                        key={placed.item.id}
                        item={placed.item}
                        day={target}
                        start={placed.start}
                        end={placed.end}
                        style={{
                          top: `calc(${placed.start / 60} * var(--hour))`,
                          height: `calc(${Math.max(placed.end - placed.start, 20) / 60} * var(--hour) - 2px)`,
                          left: `calc(${(placed.lane / placed.lanes) * 100}% + 2px)`,
                          width: `calc(${100 / placed.lanes}% - 6px)`,
                        }}
                        size={blockSize(placed.end - placed.start)}
                      />
                    ))}
                    {target === now.day && (
                      <span
                        className="class-calendar__now"
                        style={{ top: `calc(${now.minute / 60} * var(--hour))` }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CalendarEventProps {
  item: CalendarClass;
  day: PlainDay;
  start: number;
  end: number;
  /** A block on the time grid; without it, a line of a month's day. */
  style?: CSSProperties;
  /** How much of it a block has room for (`blockSize`). */
  size?: BlockSize;
}

/** A class: a block on the grid or a line in a month's day, which opens its card. */
function CalendarEvent({ item, day, start, end, style, size = "regular" }: CalendarEventProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hours = `${clock(start)} – ${clock(end)}`;
  const trigger: ReactElement = style ? (
    <button
      type="button"
      className={`class-calendar__event ${phaseModifier("event", item.phase)}${size === "regular" ? "" : ` class-calendar__event_size_${size}`}`}
      style={style}
      aria-label={`${item.title}, ${dayLong(day)}, ${hours}, ${PHASE_WORDS[item.phase]}`}
    >
      <span className="class-calendar__event-title">{item.title}</span>
      <span className="class-calendar__event-time">{hours}</span>
      {size === "long" && <span className="class-calendar__event-people">{item.people}</span>}
    </button>
  ) : (
    <button
      type="button"
      className={`class-calendar__chip ${phaseModifier("chip", item.phase)}`}
      aria-label={`${item.title}, ${hours}, ${PHASE_WORDS[item.phase]}`}
    >
      <span className="class-calendar__chip-dot" aria-hidden="true" />
      <span className="class-calendar__chip-time">{clock(start)}</span>
      <span className="class-calendar__chip-title">{item.title}</span>
    </button>
  );

  return (
    <Popover.Root>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Content
        ref={cardRef}
        // The card itself takes the focus, not its first control: Tab walks it from there.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cardRef.current?.focus();
        }}
        className="class-calendar__card"
        side="right"
        align="start"
        sideOffset={8}
        collisionPadding={16}
        aria-label={item.title}
      >
        <div className="class-calendar__card-head">
          <ClassStatusTag phase={item.phase} audience="teacher" />
          <Popover.Close
            className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square"
            aria-label="Cerrar"
          >
            <XmarkIcon variant="classic-solid" className="platform-button__icon" />
          </Popover.Close>
        </div>
        <h3 className="class-calendar__card-title">{item.title}</h3>
        <p className="class-calendar__card-line">
          {dayLong(day)} · {hours}
        </p>
        <p className="class-calendar__card-line">{item.people}</p>
        <div className="class-calendar__card-actions">
          {item.meetingUrl && JOINABLE.includes(item.phase) && (
            <a
              href={item.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="platform-button platform-button_variant_accent platform-button_size_sm"
            >
              <VideoIcon variant="classic-solid" className="platform-button__icon" />
              Entrar a la clase
            </a>
          )}
          <Link href={item.href} className="platform-button platform-button_size_sm">
            Ver la clase
          </Link>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}

interface MonthGridProps {
  days: PlainDay[];
  /** "2026-10": the days outside it are drawn faint. */
  month: string;
  today: PlainDay;
  byDay: Map<PlainDay, DayClass[]>;
  onOpenDay: (day: PlainDay) => void;
}

/** A month in six weeks: each day its number and its first classes, «+N más» for the rest. */
function MonthGrid({ days, month, today, byDay, onOpenDay }: MonthGridProps) {
  return (
    <div className="class-calendar__month">
      {days.slice(0, 7).map((target) => (
        <span key={target} className="class-calendar__month-weekday">
          {weekdayShort(target)}
        </span>
      ))}
      {days.map((target) => {
        const list = byDay.get(target) ?? [];
        const cell = [
          "class-calendar__cell",
          target.startsWith(month) ? "" : "class-calendar__cell_state_outside",
          target === today ? "class-calendar__cell_state_today" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <div key={target} className={cell}>
            <button
              type="button"
              className="class-calendar__cell-date"
              aria-label={`Ver el ${dayLong(target)}`}
              onClick={() => onOpenDay(target)}
            >
              {Number(target.slice(8))}
            </button>
            {list.slice(0, MONTH_CHIPS).map((entry) => (
              <CalendarEvent key={entry.item.id} item={entry.item} day={target} start={entry.start} end={entry.end} />
            ))}
            {list.length > MONTH_CHIPS && (
              <button type="button" className="class-calendar__more" onClick={() => onOpenDay(target)}>
                {list.length - MONTH_CHIPS} más
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface MiniMonthProps {
  /** Its first day. */
  month: PlainDay;
  selected: PlainDay;
  today: PlainDay;
  /** The days the grid shows, tinted as Google Calendar marks the week in sight; none in the month view. */
  inView: PlainDay[];
  hasClasses: (day: PlainDay) => boolean;
  onMonth: (month: PlainDay) => void;
  onPick: (day: PlainDay) => void;
}

/** The small month at the side: its own arrows, and a day to jump to, a dot under the days with classes. */
function MiniMonth({ month, selected, today, inView, hasClasses, onMonth, onPick }: MiniMonthProps) {
  const days = daysOf("month", month);
  return (
    <div className="class-calendar__mini">
      <div className="class-calendar__mini-head">
        <span className="class-calendar__mini-title">{viewTitle("month", month)}</span>
        <button
          type="button"
          className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square"
          aria-label="Mes anterior en el calendario pequeño"
          onClick={() => onMonth(stepDay("month", month, -1))}
        >
          <ChevronLeftIcon variant="classic-solid" className="platform-button__icon" />
        </button>
        <button
          type="button"
          className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square"
          aria-label="Mes siguiente en el calendario pequeño"
          onClick={() => onMonth(stepDay("month", month, 1))}
        >
          <ChevronRightIcon variant="classic-solid" className="platform-button__icon" />
        </button>
      </div>
      <div className="class-calendar__mini-grid">
        {days.slice(0, 7).map((target) => (
          <span key={target} className="class-calendar__mini-weekday" aria-hidden="true">
            {weekdayShort(target).charAt(0)}
          </span>
        ))}
        {days.map((target) => {
          const day = [
            "class-calendar__mini-day",
            target.startsWith(month.slice(0, 7)) ? "" : "class-calendar__mini-day_state_outside",
            target === today ? "class-calendar__mini-day_state_today" : "",
            inView.includes(target) ? "class-calendar__mini-day_state_in-view" : "",
            hasClasses(target) ? "class-calendar__mini-day_state_busy" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={target}
              type="button"
              className={day}
              aria-label={dayLong(target)}
              aria-pressed={target === selected}
              onClick={() => onPick(target)}
            >
              {Number(target.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
