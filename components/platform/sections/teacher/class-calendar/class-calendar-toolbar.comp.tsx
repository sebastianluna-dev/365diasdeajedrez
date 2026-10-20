import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import type { CalendarView } from "./class-calendar.dates";
import "./class-calendar-toolbar.comp.css";

interface ClassCalendarToolbarProps {
  view: CalendarView;
  /** What is in sight: «19 – 25 de octubre de 2026». */
  title: string;
  onToday: () => void;
  /** A day, a week or a month back (-1) or ahead (1), as the view says. */
  onStep: (direction: -1 | 1) => void;
  onView: (view: CalendarView) => void;
}

const VIEWS: { view: CalendarView; label: string }[] = [
  { view: "day", label: "Día" },
  { view: "week", label: "Semana" },
  { view: "month", label: "Mes" },
];

/** «Día anterior», «Semana siguiente»…: what each arrow says by the view. */
const STEP_LABELS: Record<CalendarView, [string, string]> = {
  day: ["Día anterior", "Día siguiente"],
  week: ["Semana anterior", "Semana siguiente"],
  month: ["Mes anterior", "Mes siguiente"],
};

/**
 * The calendar's controls, the way Google Calendar puts them in its bar:
 * «Hoy», the arrows, the title of what is in sight and «Día · Semana · Mes».
 * The calendar owns the state and hands it here; it lands in the platform's
 * bar through `PlatformHeaderContext`, or stays over the calendar where there
 * is no bar.
 */
export function ClassCalendarToolbar({ view, title, onToday, onStep, onView }: ClassCalendarToolbarProps) {
  const [back, ahead] = STEP_LABELS[view];
  return (
    <div className="class-calendar-toolbar">
      <button type="button" className="platform-button platform-button_size_sm" onClick={onToday}>
        Hoy
      </button>
      <div className="class-calendar-toolbar__steps">
        <button
          type="button"
          className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square"
          aria-label={back}
          onClick={() => onStep(-1)}
        >
          <ChevronLeftIcon variant="classic-solid" className="platform-button__icon" />
        </button>
        <button
          type="button"
          className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square"
          aria-label={ahead}
          onClick={() => onStep(1)}
        >
          <ChevronRightIcon variant="classic-solid" className="platform-button__icon" />
        </button>
      </div>
      <h2 className="class-calendar-toolbar__title" aria-live="polite">
        {title}
      </h2>
      <div className="class-calendar-toolbar__views" role="group" aria-label="Vista">
        {VIEWS.map((option) => (
          <button
            key={option.view}
            type="button"
            className="class-calendar-toolbar__view"
            aria-pressed={view === option.view}
            onClick={() => onView(option.view)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
