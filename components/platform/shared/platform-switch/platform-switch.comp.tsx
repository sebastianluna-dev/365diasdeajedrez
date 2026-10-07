"use client";

import { useId } from "react";
import { Switch } from "radix-ui";
import { savedValueKey } from "../saved-value-key";
import "./platform-switch.comp.css";

interface PlatformSwitchProps {
  /** What is switched on, at the left of the row. */
  label: string;
  /** A line under the label: what switching it on does. */
  hint?: string;
  /** The name of the hidden native checkbox that carries it in the form. */
  name?: string;
  /** Id of the form it belongs to, when it is drawn outside it. */
  form?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /**
   * The colour of a switch that is on and of its focus ring. `selection`
   * (default) is the blue of filling in a form; `accent` the brand's red, for
   * a setting of a screen one studies on, outside any form to fill in (the
   * lesson outline's priority filter).
   */
  tone?: "selection" | "accent";
  /** The host's class for the row, to lay it out where it goes. */
  className?: string;
}

/**
 * An on/off that takes effect the moment it is pressed: the row is the
 * switch, on Radix's `Switch` primitive (`role="switch"`). Off, the row is
 * grey and sunk into what holds it; on, it is a white card lifted off it, and
 * the knob at its right has crossed to the accent. What is saved with a form's
 * button is a `PlatformCheckbox`, not this.
 *
 * It is mounted under the value it opens with (`savedValueKey`): after a save
 * that changed it, it starts again from what was saved instead of going back,
 * on the form's reset, to what it showed when the page was loaded.
 */
export function PlatformSwitch(props: PlatformSwitchProps) {
  return <Row key={savedValueKey(props.defaultChecked)} {...props} />;
}

function Row({ label, hint, tone = "selection", className, ...rootProps }: PlatformSwitchProps) {
  const labelId = useId();
  const hintId = useId();

  return (
    // Holds the hidden native checkbox the primitive positions beside the row.
    <div
      className={["platform-switch", tone === "accent" && "platform-switch_tone_accent", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Switch.Root
        aria-labelledby={labelId}
        aria-describedby={hint ? hintId : undefined}
        className="platform-switch__control"
        {...rootProps}
      >
        <span className="platform-switch__text">
          <span id={labelId} className="platform-switch__label">
            {label}
          </span>
          {hint && (
            <span id={hintId} className="platform-switch__hint">
              {hint}
            </span>
          )}
        </span>
        <span className="platform-switch__track">
          <Switch.Thumb className="platform-switch__thumb" />
        </span>
      </Switch.Root>
    </div>
  );
}
