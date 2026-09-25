"use client";

import { type ComponentProps, type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Popover } from "radix-ui";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { ChevronIcon } from "@/components/icons/chevron-icon.comp";
import { formatSpanishDate, MONTHS_ES } from "@/lib/format-spanish-date";
import "./platform-date-picker.comp.css";

interface PlatformDatePickerProps extends Omit<
  ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "form"
> {
  /** The name of the hidden native date input that carries the value in the form. */
  name?: string;
  /** The `<form>` that input belongs to, when it is not an ancestor. */
  form?: string;
  /** Controlled value, `yyyy-mm-dd`; `""` means no date. */
  value?: string;
  defaultValue?: string;
  /** Called with the new value, `""` when cleared. */
  onValueChange?: (value: string) => void;
  /** What the trigger says while no date is chosen. */
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** Earliest and latest choosable days, `yyyy-mm-dd`. */
  min?: string;
  max?: string;
  /** `regular` matches the inputs of `PlatformForm`; `compact` the ones of `FormField`. */
  size?: "regular" | "compact";
}

/** Monday first, as the week is read here. */
const WEEKDAYS = [
  { short: "L", long: "lunes" },
  { short: "M", long: "martes" },
  { short: "X", long: "miércoles" },
  { short: "J", long: "jueves" },
  { short: "V", long: "viernes" },
  { short: "S", long: "sábado" },
  { short: "D", long: "domingo" },
];

/** The same styles Radix gives its hidden native controls: present for the form and the validation, invisible. */
const HIDDEN_INPUT_STYLE = {
  position: "absolute",
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  wordWrap: "normal",
} as const;

/** `yyyy-mm-dd` → a local Date at midnight, or null when it is not a date. */
function parseIso(value: string | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** A local Date → `yyyy-mm-dd`, without going through UTC, which shifts the day near midnight. */
function toIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function firstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number): Date {
  // Clamped to the month's length so the 31st does not spill into the next month.
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
}

/** The six weeks a month view shows, Monday to Sunday, padded with the neighbouring months' days. */
function weeksOf(month: Date): Date[][] {
  const first = firstOfMonth(month);
  // getDay() has Sunday as 0; the grid starts on Monday.
  const offset = (first.getDay() + 6) % 7;
  const start = addDays(first, -offset);
  return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)));
}

/**
 * The platform's date picker: a trigger that looks like the platform's
 * inputs and, on Radix's `Popover`, a month calendar drawn with the
 * platform's tokens. Radix has no date primitive, so the calendar is ours:
 * a `grid` of day buttons with roving focus (arrows move a day or a week,
 * Home and End go to the week's ends, PageUp and PageDown change the month),
 * "Hoy" and "Borrar" under it.
 *
 * Inside a form it submits like `<input type="date">`: a hidden native date
 * input carries the value, and with it `required`, `min` and `max` keep the
 * browser's validation. Everything not listed in the props (`id`, `aria-*`,
 * `className`, `ref`) goes to the trigger button, which is what a label
 * targets.
 *
 * The calendar is NOT portalled, like the select's list: it renders next to
 * the trigger, positioned against the viewport, so it also works inside a
 * modal `<dialog>`. The popover is not modal either, so the page keeps
 * scrolling and its scrollbar.
 */
export function PlatformDatePicker({
  name,
  form,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder = "Elige una fecha",
  required,
  disabled,
  min,
  max,
  size = "regular",
  className,
  ...triggerProps
}: PlatformDatePickerProps) {
  const isControlled = valueProp !== undefined;
  const [inner, setInner] = useState(defaultValue ?? "");
  const value = isControlled ? valueProp : inner;
  const selected = parseIso(value);

  const [open, setOpen] = useState(false);
  // The month on screen and the day that holds the keyboard focus, which is
  // not the chosen one: the arrows move it without choosing.
  const [month, setMonth] = useState(() => firstOfMonth(selected ?? new Date()));
  const [focused, setFocused] = useState(() => selected ?? new Date());
  const gridRef = useRef<HTMLDivElement>(null);
  const captionId = useId();

  const minDate = parseIso(min);
  const maxDate = parseIso(max);
  const isOutOfRange = (date: Date) => (minDate !== null && date < minDate) || (maxDate !== null && date > maxDate);

  const commit = (next: string) => {
    if (!isControlled) setInner(next);
    onValueChange?.(next);
  };

  const choose = (date: Date) => {
    if (isOutOfRange(date)) return;
    commit(toIso(date));
    setOpen(false);
  };

  // Opening lands on the chosen day, or on today, in its month.
  const handleOpenChange = (next: boolean) => {
    if (next) {
      const start = selected ?? new Date();
      setMonth(firstOfMonth(start));
      setFocused(start);
    }
    setOpen(next);
  };

  const focusFocusedDay = () => gridRef.current?.querySelector<HTMLButtonElement>('[data-focused="true"]')?.focus();

  // Moving the focus with the keys may turn the page to a month that was not
  // on screen a moment ago: the day gets the focus once it is rendered. The
  // opening is handled by the popover's own auto-focus event below, because
  // the content mounts a tick after `open` flips and this effect would miss it.
  useEffect(() => {
    if (open) focusFocusedDay();
  }, [open, focused]);

  const moveFocus = (date: Date) => {
    setFocused(date);
    setMonth(firstOfMonth(date));
  };

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      // Monday and Sunday of the focused week.
      Home: () => addDays(focused, -((focused.getDay() + 6) % 7)),
      End: () => addDays(focused, 6 - ((focused.getDay() + 6) % 7)),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    moveFocus(move());
  };

  const today = new Date();
  const todayIso = toIso(today);
  const focusedIso = toIso(focused);

  const triggerClassName = [
    "platform-date-picker__trigger",
    `platform-date-picker__trigger_size_${size}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="platform-date-picker">
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger
          type="button"
          className={triggerClassName}
          disabled={disabled}
          aria-required={required || undefined}
          data-placeholder={selected ? undefined : ""}
          {...triggerProps}
        >
          <CalendarIcon className="platform-date-picker__icon" />
          <span className="platform-date-picker__value">{selected ? formatSpanishDate(selected) : placeholder}</span>
        </Popover.Trigger>

        {/* The form's and the browser's: it carries the value, `required`, `min`
            and `max`, and the validation bubble anchors to it, at the trigger. */}
        <input
          type="date"
          aria-hidden="true"
          tabIndex={-1}
          name={name}
          form={form}
          value={value}
          onChange={(event) => commit(event.target.value)}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          style={HIDDEN_INPUT_STYLE}
        />

        <Popover.Content
          className="platform-date-picker__content"
          align="start"
          sideOffset={6}
          // The grid takes the focus itself, on the focused day, instead of the
          // first tabbable thing (the "Mes anterior" button).
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            focusFocusedDay();
          }}
        >
          <div className="platform-date-picker__head">
            <button
              type="button"
              className="platform-date-picker__nav"
              aria-label="Mes anterior"
              onClick={() => moveFocus(addMonths(focused, -1))}
            >
              <ChevronIcon className="platform-date-picker__nav-icon platform-date-picker__nav-icon_direction_back" />
            </button>
            <span id={captionId} className="platform-date-picker__caption" aria-live="polite">
              {MONTHS_ES[month.getMonth()]} {month.getFullYear()}
            </span>
            <button
              type="button"
              className="platform-date-picker__nav"
              aria-label="Mes siguiente"
              onClick={() => moveFocus(addMonths(focused, 1))}
            >
              <ChevronIcon className="platform-date-picker__nav-icon" />
            </button>
          </div>

          <div
            ref={gridRef}
            role="grid"
            aria-labelledby={captionId}
            className="platform-date-picker__grid"
            onKeyDown={handleGridKeyDown}
          >
            <div role="row" className="platform-date-picker__week">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday.long} role="columnheader" className="platform-date-picker__weekday">
                  <abbr title={weekday.long}>{weekday.short}</abbr>
                </span>
              ))}
            </div>
            {weeksOf(month).map((week) => (
              <div key={toIso(week[0] as Date)} role="row" className="platform-date-picker__week">
                {week.map((date) => {
                  const iso = toIso(date);
                  const isSelected = selected !== null && iso === value;
                  const isFocused = iso === focusedIso;
                  const outside = date.getMonth() !== month.getMonth();
                  return (
                    <span key={iso} role="gridcell" aria-selected={isSelected} className="platform-date-picker__cell">
                      <button
                        type="button"
                        className={`platform-date-picker__day${outside ? " platform-date-picker__day_outside" : ""}${isSelected ? " platform-date-picker__day_selected" : ""}`}
                        tabIndex={isFocused ? 0 : -1}
                        data-focused={isFocused ? "true" : undefined}
                        aria-current={iso === todayIso ? "date" : undefined}
                        aria-label={formatSpanishDate(date)}
                        disabled={isOutOfRange(date)}
                        onClick={() => choose(date)}
                        onFocus={() => setFocused(date)}
                      >
                        {date.getDate()}
                      </button>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="platform-date-picker__foot">
            <button
              type="button"
              className="platform-date-picker__action"
              disabled={isOutOfRange(today)}
              onClick={() => choose(today)}
            >
              Hoy
            </button>
            {selected && !required && (
              <button
                type="button"
                className="platform-date-picker__action"
                onClick={() => {
                  commit("");
                  setOpen(false);
                }}
              >
                Borrar
              </button>
            )}
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}
