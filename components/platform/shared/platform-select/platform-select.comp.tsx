"use client";

import { type ComponentProps, useState } from "react";
import { Select } from "radix-ui";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { AngleRightIcon } from "@/components/icons/angle-right-icon.comp";
import { usePlatformLook } from "@/components/platform/shared/platform-look";
import { savedValueKey } from "../saved-value-key";
import "./platform-select.comp.css";

export interface PlatformSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** A titled run of options, what `<optgroup>` is to a native select. */
export interface PlatformSelectGroup {
  label: string;
  options: PlatformSelectOption[];
}

interface PlatformSelectProps extends Omit<ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "form"> {
  /** The choices, in order. Either this or `groups`, or both (these come first). */
  options?: PlatformSelectOption[];
  /** The choices under headings. */
  groups?: PlatformSelectGroup[];
  /**
   * A choice that means "none" and submits the empty string, like a native
   * `<option value="">`: its label heads the list and is what the trigger
   * shows while nothing else is chosen. The primitive forbids an item with an
   * empty value, so it is an item with a private value that is mapped back to
   * `""` on the way out.
   */
  emptyOption?: string;
  /** The name of the hidden native `<select>` that carries the value in the form. */
  name?: string;
  /** The `<form>` the hidden select belongs to, when it is not an ancestor. */
  form?: string;
  /** Controlled value; `""` means nothing chosen. */
  value?: string;
  defaultValue?: string;
  /** Called with the new value, `""` for the empty option. */
  onValueChange?: (value: string) => void;
  /** What the trigger says while nothing is chosen. `emptyOption` takes its place. */
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /**
   * The colour of the focus and of the option under the pointer. `selection`
   * (default) is the blue of filling in a form; `accent` the brand's red, for
   * a select that sorts or filters what is on the screen, outside any form
   * (the order of «Mis estudios»): a filter is not a form and never says an
   * error, so its red cannot be read as one.
   */
  tone?: "selection" | "accent";
}

/** The private value of the empty option's item. It never leaves the component. */
const EMPTY_VALUE = "\u0000empty";

/** The label of the option a value stands for, wherever it is listed. */
function findOptionLabel(
  options: PlatformSelectOption[] | undefined,
  groups: PlatformSelectGroup[] | undefined,
  value: string,
): string | undefined {
  const all = [...(options ?? []), ...(groups ?? []).flatMap((group) => group.options)];
  return all.find((option) => option.value === value)?.label;
}

/**
 * The platform's select, on Radix's `Select` primitive: a button that opens a
 * list, keyboard-navigable and typeahead-searchable, drawn with the platform's
 * tokens instead of the browser's.
 *
 * Inside a form it submits like a native select: the primitive keeps a hidden
 * `<select name>` in sync with the choice. Everything not listed here (`id`,
 * `aria-*`, `className`, `ref`) goes to the trigger button, which is what a
 * `PlatformFormField`'s label names.
 *
 * The list is NOT portalled: it renders next to the trigger, positioned
 * against the viewport, so it also works inside a modal `<dialog>`, whose top
 * layer would leave a portal to `<body>` inert.
 *
 * In a popup of a page moved to the new design system (`usePlatformLook`) its
 * trigger is Material 3's outlined field with its caret, the box of
 * `PlatformFormField`'s, and its list Material's menu: 48px options on the
 * container, the chosen one on the secondary container.
 *
 * It is mounted under the value it opens with (`savedValueKey`): after a save
 * that changed it, the select starts again from what was saved instead of
 * going back, on the form's reset, to what it showed when the page was loaded.
 */
export function PlatformSelect(props: PlatformSelectProps) {
  return <SelectControl key={savedValueKey(props.defaultValue)} {...props} />;
}

function SelectControl({
  options = [],
  groups = [],
  emptyOption,
  name,
  form,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder,
  required,
  disabled,
  tone = "selection",
  className,
  ...triggerProps
}: PlatformSelectProps) {
  // The value is held here even when uncontrolled, because the empty option's
  // private value has to be turned into `""` before anyone sees it.
  const isControlled = valueProp !== undefined;
  const [inner, setInner] = useState(defaultValue ?? "");
  const value = isControlled ? valueProp : inner;
  // In a popup of a moved page: Material's outlined field and its menu.
  const look = usePlatformLook();

  const handleValueChange = (next: string) => {
    const resolved = next === EMPTY_VALUE ? "" : next;
    if (!isControlled) setInner(resolved);
    onValueChange?.(resolved);
  };

  const triggerClassName = [
    "platform-select__trigger",
    emptyOption ? "platform-select__trigger_empty_named" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  // What the trigger says: the label of whatever is chosen.
  const chosen = value ? findOptionLabel(options, groups, value) : undefined;

  const renderOption = (option: PlatformSelectOption) => (
    <Select.Item key={option.value} value={option.value} disabled={option.disabled} className="platform-select__item">
      <Select.ItemText>{option.label}</Select.ItemText>
      <Select.ItemIndicator className="platform-select__indicator">
        <CheckIcon className="platform-select__check" />
      </Select.ItemIndicator>
    </Select.Item>
  );

  return (
    <div
      className={`platform-select${tone === "accent" ? " platform-select_tone_accent" : ""}${look === "material" ? " platform-select_look_material" : ""}`}
    >
      <Select.Root
        name={name}
        form={form}
        value={value}
        onValueChange={handleValueChange}
        required={required}
        disabled={disabled}
      >
        <Select.Trigger className={triggerClassName} {...triggerProps}>
          {/* The label is handed in as the child and not left to the
              primitive: it resolves the chosen option from the items, which do
              not exist until the browser mounts them, so a server-rendered
              select arrived with an empty trigger and filled itself in once
              the JavaScript landed. Given here it is right from the first
              paint, and it still follows the value, which is state. */}
          <Select.Value placeholder={emptyOption ?? placeholder}>{chosen}</Select.Value>
          <Select.Icon className="platform-select__icon">
            <AngleRightIcon className="platform-select__chevron" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Content className="platform-select__content" position="popper" sideOffset={6}>
          <Select.Viewport className="platform-select__viewport">
            {emptyOption && (
              /* The check is drawn by hand: the primitive only marks the item
                 whose value is the current one, and this one stands for `""`. */
              <Select.Item
                value={EMPTY_VALUE}
                className={`platform-select__item${value === "" ? " platform-select__item_chosen" : ""}`}
              >
                <Select.ItemText>{emptyOption}</Select.ItemText>
                {value === "" && (
                  <span className="platform-select__indicator">
                    <CheckIcon className="platform-select__check" />
                  </span>
                )}
              </Select.Item>
            )}
            {options.map(renderOption)}
            {groups.map((group) => (
              <Select.Group key={group.label} className="platform-select__group">
                <Select.Label className="platform-select__group-label">{group.label}</Select.Label>
                {group.options.map(renderOption)}
              </Select.Group>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
    </div>
  );
}
