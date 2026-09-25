"use client";

import type { ComponentProps } from "react";
import { Select } from "radix-ui";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ChevronIcon } from "@/components/icons/chevron-icon.comp";
import "./platform-select.comp.css";

export interface PlatformSelectOption {
  value: string;
  label: string;
}

interface PlatformSelectProps extends Omit<ComponentProps<"button">, "value" | "defaultValue" | "onChange"> {
  options: PlatformSelectOption[];
  /** The name of the hidden native `<select>` that carries the value in the form. */
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** What the trigger says while nothing is chosen. */
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * The platform's select, on Radix's `Select` primitive: a button that opens a
 * list, keyboard-navigable and typeahead-searchable, drawn with the platform's
 * tokens instead of the browser's.
 *
 * Inside a form it submits like a native select: the primitive keeps a hidden
 * `<select name>` in sync with the choice. Everything not listed here (`id`,
 * `aria-*`, `className`, `ref`) goes to the trigger button, which is what
 * `PlatformFormField` labels.
 *
 * The list is NOT portalled: it renders next to the trigger, positioned
 * against the viewport, so it also works inside a modal `<dialog>`, whose top
 * layer would leave a portal to `<body>` inert.
 */
export function PlatformSelect({
  options,
  name,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  required,
  disabled,
  className,
  ...triggerProps
}: PlatformSelectProps) {
  return (
    <div className="platform-select">
      <Select.Root
        name={name}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        required={required}
        disabled={disabled}
      >
        <Select.Trigger
          className={className ? `platform-select__trigger ${className}` : "platform-select__trigger"}
          {...triggerProps}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon className="platform-select__icon">
            <ChevronIcon className="platform-select__chevron" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Content className="platform-select__content" position="popper" sideOffset={6}>
          <Select.Viewport className="platform-select__viewport">
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value} className="platform-select__item">
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="platform-select__indicator">
                  <CheckIcon className="platform-select__check" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
    </div>
  );
}
