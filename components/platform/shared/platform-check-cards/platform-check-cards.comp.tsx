"use client";

import { useState } from "react";
import { Checkbox } from "radix-ui";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import type { PlatformChoiceCardOption } from "../platform-choice-cards/platform-choice-cards.comp";
import "./platform-check-cards.comp.css";

interface PlatformCheckCardsProps {
  options: PlatformChoiceCardOption[];
  /** The name of the hidden native checkboxes that carry the values in the form, one per chosen card. */
  name?: string;
  /** Controlled set of chosen values. */
  value?: string[];
  defaultValue?: string[];
  /** Called with the whole new set, in the order the cards were chosen. */
  onValueChange?: (values: string[]) => void;
  disabled?: boolean;
  /** Id of the element that names the group, usually a `PlatformFormGroup` label. */
  "aria-labelledby"?: string;
  "aria-label"?: string;
}

/**
 * Several choices among a few, each drawn as a card: a group of checkboxes
 * where the whole card is the box. On Radix's `Checkbox` primitive, so each
 * card is a tab stop, Space toggles it, and inside a form every chosen card
 * submits through the hidden native checkbox the primitive keeps in sync
 * (`formData.getAll(name)` reads the set). Checked state is the primitive's
 * `data-state`, which the stylesheet reads.
 *
 * A sibling of `PlatformChoiceCards` and not a mode of it: a radio group is
 * one tab stop with one value, a checkbox group is many of each.
 */
export function PlatformCheckCards({
  options,
  name,
  value,
  defaultValue,
  onValueChange,
  disabled,
  ...labelling
}: PlatformCheckCardsProps) {
  const [own, setOwn] = useState<string[]>(defaultValue ?? []);
  const chosen = value ?? own;

  const toggle = (optionValue: string, checked: boolean) => {
    const rest = chosen.filter((item) => item !== optionValue);
    const next = checked ? [...rest, optionValue] : rest;
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };

  return (
    <div role="group" className="platform-check-cards" {...labelling}>
      {options.map((option) => (
        <Checkbox.Root
          key={option.value}
          name={name}
          value={option.value}
          checked={chosen.includes(option.value)}
          onCheckedChange={(checked) => toggle(option.value, checked === true)}
          disabled={disabled}
          className="platform-check-cards__card"
        >
          <Checkbox.Indicator className="platform-check-cards__mark" forceMount>
            <CheckIcon className="platform-check-cards__mark-icon" />
          </Checkbox.Indicator>
          {option.icon && (
            <span className="platform-check-cards__icon" aria-hidden="true">
              {option.icon}
            </span>
          )}
          <span className="platform-check-cards__label">{option.label}</span>
          {option.description && <span className="platform-check-cards__description">{option.description}</span>}
        </Checkbox.Root>
      ))}
    </div>
  );
}
