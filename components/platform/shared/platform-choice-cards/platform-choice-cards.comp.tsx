"use client";

import type { ReactNode } from "react";
import { RadioGroup } from "radix-ui";
import "./platform-choice-cards.comp.css";

export interface PlatformChoiceCardOption {
  value: string;
  label: string;
  /** One line under the label. */
  description?: string;
  /** Drawn above the label; decorative, the label carries the meaning. */
  icon?: ReactNode;
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
 */
export function PlatformChoiceCards({ options, ...rootProps }: PlatformChoiceCardsProps) {
  return (
    <RadioGroup.Root className="platform-choice-cards" {...rootProps}>
      {options.map((option) => (
        <RadioGroup.Item key={option.value} value={option.value} className="platform-choice-cards__card">
          {option.icon && (
            <span className="platform-choice-cards__icon" aria-hidden="true">
              {option.icon}
            </span>
          )}
          <span className="platform-choice-cards__label">{option.label}</span>
          {option.description && <span className="platform-choice-cards__description">{option.description}</span>}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
