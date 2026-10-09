"use client";

import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import { AngleDownIcon } from "@/components/icons/angle-down-icon.comp";
import { ChessBoardIcon } from "@/components/icons/chess-board-icon.comp";
import { DumbbellIcon } from "@/components/icons/dumbbell-icon.comp";
import { FileImportIcon } from "@/components/icons/file-import-icon.comp";
import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import type { PlatformNavDropdown, PlatformNavMenuItem } from "@/constants/platform/nav-items.const";
import "./platform-nav-menu.comp.css";

const ICONS: Record<PlatformNavMenuItem["icon"], typeof ChessBoardIcon> = {
  "analysis-board": ChessBoardIcon,
  import: FileImportIcon,
  explorer: MagnifyingGlassIcon,
  trainer: DumbbellIcon,
};

interface PlatformNavMenuProps {
  menu: PlatformNavDropdown;
  /** The address lit in the bar: the trigger is lit when it is one of its tools, and so is that tool. */
  activeHref: string | null;
}

/**
 * A dropdown of the platform's top bar (M3), on Radix's `DropdownMenu`: the
 * trigger says its name and lights up like an item when one of its tools is
 * the current page; the menu opens under it, aligned to its right edge, in
 * two columns from 1024px, each tool with its icon and the line that says
 * what it is for. Keyboard, focus, Escape and a click outside come with the
 * primitive. It is portalled to `<body>`: the bar scrolls sideways and would
 * clip it, and no dialog is ever open under it.
 */
export function PlatformNavMenu({ menu, activeHref }: PlatformNavMenuProps) {
  const isActive = menu.items.some((item) => item.href === activeHref);
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className={`platform-nav-menu__trigger${isActive ? " platform-nav-menu__trigger_state_active" : ""}`}
      >
        {menu.label}
        <AngleDownIcon variant="classic-solid" className="platform-nav-menu__chevron" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="platform-nav-menu" align="end" sideOffset={8} collisionPadding={16}>
          {menu.items.map((item) => {
            const Icon = ICONS[item.icon];
            const current = item.href === activeHref;
            return (
              <DropdownMenu.Item key={item.href} asChild>
                <Link
                  href={item.href}
                  className={`platform-nav-menu__item${current ? " platform-nav-menu__item_state_current" : ""}`}
                  aria-current={current ? "page" : undefined}
                >
                  <Icon className="platform-nav-menu__icon" />
                  <span className="platform-nav-menu__text">
                    <span className="platform-nav-menu__label">{item.label}</span>
                    <span className="platform-nav-menu__description">{item.description}</span>
                  </span>
                </Link>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
