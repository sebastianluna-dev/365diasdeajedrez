"use client";

import type { ReactNode } from "react";
import { RadioGroup } from "radix-ui";
import { savedValueKey } from "../saved-value-key";
import "./platform-choice-cards.comp.css";

export interface PlatformChoiceCardOption {
  value: string;
  label: string;
  /** A short fact of the option, between the label and the description: a range, a figure. */
  meta?: string;
  /** One line under the label. */
  description?: string;
  /** Drawn above the label; decorative, the label carries the meaning. */
  icon?: ReactNode;
  /** Offered, but not choosable: a rule of the group rules it out for now. */
  disabled?: boolean;
}

interface PlatformChoiceCardsProps {
  options: PlatformChoiceCardOption[];
  /** The name of the hidden native radio that carries the value in the form. */
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  /** Id of the element that names the group, usually a `PlatformFormGroup` label. */
  "aria-labelledby"?: string;
  "aria-label"?: string;
}

/**
 * One choice among a few, each drawn as a card: a radio group where the whole
 * card is the radio. On Radix's `RadioGroup` primitive, so it is one tab stop,
 * the arrows move the choice, and inside a form it submits through the hidden
 * native radio the primitive keeps in sync. Checked state is the primitive's
 * `data-state`, which the stylesheet reads.
 *
 * The group is mounted under the value it opens with (`savedValueKey`): after
 * a save that changed it, it starts again from what was saved instead of going
 * back, on the form's reset, to what it showed when the page was loaded.
 */
export function PlatformChoiceCards({ options, ...rootProps }: PlatformChoiceCardsProps) {
  return (
    <RadioGroup.Root key={savedValueKey(rootProps.defaultValue)} className="platform-choice-cards" {...rootProps}>
      {options.map((option) => (
        <RadioGroup.Item key={option.value} value={option.value} className="platform-choice-cards__card">
          {option.icon && (
            <span className="platform-choice-cards__icon" aria-hidden="true">
              {option.icon}
            </span>
          )}
          <span className="platform-choice-cards__label">{option.label}</span>
          {option.meta && <span className="platform-choice-cards__meta">{option.meta}</span>}
          {option.description && <span className="platform-choice-cards__description">{option.description}</span>}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
