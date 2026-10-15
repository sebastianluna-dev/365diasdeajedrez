"use client";

import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import { EllipsisVerticalIcon } from "@/components/icons/ellipsis-vertical-icon.comp";
import "./platform-actions-menu.comp.css";

export interface PlatformActionsMenuItem {
  label: string;
  /** What the item does; or `href`, and it is a link. */
  onSelect?: () => void;
  href?: string;
  disabled?: boolean;
  /** Why it cannot be chosen, as a second line of the item (never a tooltip: a menu item holds no other control). */
  reason?: string;
  /** `danger` for what destroys. */
  tone?: "danger";
}

interface PlatformActionsMenuProps {
  /** The trigger's accessible name: «Acciones del pago». */
  label: string;
  items: PlatformActionsMenuItem[];
}

/**
 * The «…» menu of a row or a card, on Radix's `DropdownMenu`: a quiet square
 * button that opens a short list of actions under it, aligned to its right.
 * Not modal and NOT portalled: a portal to `<body>` would be inert under a
 * modal `<dialog>`, and these menus live in popups too. An item that cannot
 * be chosen stays on the list, greyed, with its reason as a second line.
 * Enters in 160 ms and leaves in 120 on its `data-state`.
 */
export function PlatformActionsMenu({ label, items }: PlatformActionsMenuProps) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className="platform-button platform-button_variant_quiet platform-button_size_sm platform-button_shape_square"
        aria-label={label}
      >
        <EllipsisVerticalIcon variant="classic-solid" className="platform-button__icon" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="platform-actions-menu" align="end" sideOffset={4} collisionPadding={8}>
        {items.map((item) => {
          const className = `platform-actions-menu__item${item.tone === "danger" ? " platform-actions-menu__item_tone_danger" : ""}`;
          const body = (
            <>
              <span className="platform-actions-menu__label">{item.label}</span>
              {item.disabled && item.reason && <span className="platform-actions-menu__reason">{item.reason}</span>}
            </>
          );
          if (item.href && !item.disabled) {
            return (
              <DropdownMenu.Item key={item.label} asChild>
                <Link href={item.href} className={className}>
                  {body}
                </Link>
              </DropdownMenu.Item>
            );
          }
          return (
            <DropdownMenu.Item
              key={item.label}
              className={className}
              disabled={item.disabled}
              onSelect={() => item.onSelect?.()}
            >
              {body}
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
