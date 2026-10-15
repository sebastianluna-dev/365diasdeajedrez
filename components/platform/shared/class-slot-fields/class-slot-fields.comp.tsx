"use client";

import { TriangleExclamationIcon } from "@/components/icons/triangle-exclamation-icon.comp";
import { PlatformDatePicker } from "@/components/platform/shared/platform-date-picker/platform-date-picker.comp";
import { PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { classTimeOptions } from "@/constants/platform/class-slots.const";
import { timeZoneLabel } from "@/lib/format-class-when";
import { durationOptions } from "@/services/shared/class-schedule-rules";
import { savedValueKey } from "../saved-value-key";
import "./class-slot-fields.comp.css";

export interface ClassSlotValue {
  date: string;
  time: string;
  durationMin: number;
}

interface ClassSlotFieldsProps {
  /** The prefix of the three fields' names: `slot.0` sends `slot.0.date`, `slot.0.time`, `slot.0.duration`; "" sends `date`, `time`, `duration`. */
  namePrefix: string;
  defaultValue?: Partial<ClassSlotValue>;
  /** The zone the hours are written in: the academy's. */
  timeZone: string;
  /** What `validateClassSchedule` warned about, already in words. */
  warnings?: string[];
  /** Earliest and latest choosable days, `yyyy-mm-dd`. */
  min?: string;
  max?: string;
  required?: boolean;
  onChange?: (value: Partial<ClassSlotValue>) => void;
  /** A message the server sent for this slot. */
  serverError?: string;
}

const TIMES = classTimeOptions().map((time) => ({ value: time, label: time }));

/**
 * The three fields that date a class: the day, the hour and the duration,
 * each in its own `PlatformFormField`, with the line that says the hours are
 * the academy's and the warnings the schedule rules gave (an overlap, a date
 * past) — said, never blocking. The duration list keeps an odd value a class
 * already has, so dating it again does not change it in silence.
 */
export function ClassSlotFields({
  namePrefix,
  defaultValue,
  timeZone,
  warnings = [],
  min,
  max,
  required = true,
  onChange,
  serverError,
}: ClassSlotFieldsProps) {
  const durations = durationOptions(defaultValue?.durationMin ?? null).map((minutes) => ({
    value: String(minutes),
    label: `${minutes} min`,
  }));
  const value: Partial<ClassSlotValue> = { ...defaultValue };
  const nameOf = (field: string) => (namePrefix ? `${namePrefix}.${field}` : field);
  const change = (patch: Partial<ClassSlotValue>) => {
    Object.assign(value, patch);
    onChange?.({ ...value });
  };

  return (
    <div className="class-slot-fields">
      <div className="class-slot-fields__row">
        <PlatformFormField name={nameOf("date")} label="Fecha" serverError={serverError}>
          <PlatformDatePicker
            key={savedValueKey(defaultValue?.date)}
            defaultValue={defaultValue?.date}
            placeholder="Elige un día"
            required={required}
            min={min}
            max={max}
            onValueChange={(date) => change({ date })}
          />
        </PlatformFormField>
        <PlatformFormField name={nameOf("time")} label="Hora">
          <PlatformSelect
            options={TIMES}
            defaultValue={defaultValue?.time}
            placeholder="Hora"
            required={required}
            onValueChange={(time) => change({ time })}
          />
        </PlatformFormField>
        <PlatformFormField name={nameOf("duration")} label="Duración">
          <PlatformSelect
            options={durations}
            defaultValue={defaultValue?.durationMin ? String(defaultValue.durationMin) : undefined}
            placeholder="Duración"
            required={required}
            onValueChange={(duration) => change({ durationMin: Number(duration) })}
          />
        </PlatformFormField>
      </div>
      <p className="class-slot-fields__zone">{timeZoneLabel(timeZone).replace(/^hora de /, "Horas de ")}</p>
      {warnings.length > 0 && (
        <ul className="class-slot-fields__warnings">
          {warnings.map((warning) => (
            <li key={warning} className="class-slot-fields__warning">
              <TriangleExclamationIcon variant="classic-solid" className="class-slot-fields__warning-icon" />
              {warning}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
