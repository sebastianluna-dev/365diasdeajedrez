"use client";

import { useId } from "react";
import { Checkbox } from "radix-ui";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { savedValueKey } from "../saved-value-key";
import "./platform-checkbox.comp.css";

interface PlatformCheckboxProps {
  /** What is ticked, beside the box. */
  label: string;
  /** A line under the label: what ticking it does. */
  hint?: string;
  /** The name of the hidden native checkbox that carries it in the form. */
  name?: string;
  /** What the hidden checkbox submits when ticked; `"on"` when left out. */
  value?: string;
  /** Id of the form it belongs to, when it is drawn outside it. */
  form?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** The host's class for the whole row, to lay it out in a list or a card. */
  className?: string;
}

/**
 * One box and what it says: the platform's single checkbox, on Radix's
 * `Checkbox` primitive. The whole row is its label, so a click anywhere on it
 * ticks the box; Space ticks it from the keyboard; inside a form (or tied to
 * one by `form`) it submits through the hidden native checkbox the primitive
 * keeps in sync, which is what `formCheckbox()` and `formData.getAll()` read.
 *
 * It is mounted under the value it opens with (`savedValueKey`): after a save
 * that changed it, it starts again from what was saved instead of going back,
 * on the form's reset, to what it showed when the page was loaded.
 */
export function PlatformCheckbox(props: PlatformCheckboxProps) {
  return <Box key={savedValueKey(props.defaultChecked)} {...props} />;
}

function Box({ label, hint, className, onCheckedChange, ...rootProps }: PlatformCheckboxProps) {
  const id = useId();
  const labelId = useId();
  const hintId = useId();

  return (
    <label htmlFor={id} className={className ? `platform-checkbox ${className}` : "platform-checkbox"}>
      {/* Named by the label alone and described by the hint: the row's whole
          text would otherwise be the name. */}
      <Checkbox.Root
        id={id}
        aria-labelledby={labelId}
        aria-describedby={hint ? hintId : undefined}
        onCheckedChange={(checked) => onCheckedChange?.(checked === true)}
        className="platform-checkbox__box"
        {...rootProps}
      >
        <Checkbox.Indicator className="platform-checkbox__indicator">
          <CheckIcon variant="classic-solid" className="platform-checkbox__icon" />
        </Checkbox.Indicator>
      </Checkbox.Root>

      <span className="platform-checkbox__text">
        <span id={labelId} className="platform-checkbox__label">
          {label}
        </span>
        {hint && (
          <span id={hintId} className="platform-checkbox__hint">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}
