"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { AngleDownIcon } from "@/components/icons/angle-down-icon.comp";
import {
  activeNavHref,
  isNavDropdown,
  type PlatformNavDropdown,
  type PlatformNavGroup,
} from "@/constants/platform/nav-items.const";
import { NavArt } from "./nav-art.comp";
import "./platform-side-nav.comp.css";

interface PlatformSideNavProps {
  /** Composed by role in the shell (server), the same groups the top bar draws. */
  groups: PlatformNavGroup[];
}

/** The labels of the sections that hold the current page: they start open. */
function sectionsHolding(groups: PlatformNavGroup[], href: string | null): string[] {
  if (href === null) return [];
  return groups
    .flatMap((group) => group.items)
    .filter((entry): entry is PlatformNavDropdown => isNavDropdown(entry))
    .filter((section) => section.items.some((item) => item.href === href))
    .map((section) => section.label);
}

/**
 * The menu of the side bar (2026-10-18, option B of the side-menu canvas):
 * the same entries as the top bar, one under the other, each with its
 * drawing (`NavArt`). A link goes; a section («Ejercicios», «Aprender»,
 * «Herramientas») opens in place and shows its pages under it, indented on a
 * guide line. The section that holds the current page opens on its own, and
 * opens again when a navigation lands in another one; the others stay as the
 * person left them.
 *
 * A closed section keeps its pages mounted but `inert`, so the keyboard skips
 * them and the height can be animated.
 */
export function PlatformSideNav({ groups }: PlatformSideNavProps) {
  const pathname = usePathname();
  const activeHref = activeNavHref(groups, pathname);
  const baseId = useId();
  const [open, setOpen] = useState<string[]>(() => sectionsHolding(groups, activeHref));
  // A navigation into a closed section opens it: adjusted while rendering,
  // against the address it was last opened for, rather than in an effect.
  const [openedFor, setOpenedFor] = useState(activeHref);
  if (openedFor !== activeHref) {
    setOpenedFor(activeHref);
    const holding = sectionsHolding(groups, activeHref).filter((label) => !open.includes(label));
    if (holding.length > 0) setOpen([...open, ...holding]);
  }

  const toggle = (label: string) =>
    setOpen((current) => (current.includes(label) ? current.filter((item) => item !== label) : [...current, label]));

  // The drawings' column is kept only where some entry has one: the staff's
  // menu has none and is drawn as text.
  const hasArt = groups.some((group) => group.items.some((entry) => entry.art));

  return (
    <nav className="platform-side-nav" aria-label="Navegación principal">
      <ul className="platform-side-nav__list">
        {groups.flatMap((group, groupIndex) =>
          group.items.map((entry, index) => {
            const art = entry.art ? (
              <NavArt art={entry.art} className="platform-side-nav__art" />
            ) : (
              hasArt && <span className="platform-side-nav__art" aria-hidden="true" />
            );

            if (!isNavDropdown(entry)) {
              const isActive = entry.href === activeHref;
              return (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    className={`platform-side-nav__entry${isActive ? " platform-side-nav__entry_state_current" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {art}
                    <span className="platform-side-nav__label">{entry.label}</span>
                  </Link>
                </li>
              );
            }

            const isOpen = open.includes(entry.label);
            const holdsCurrent = entry.items.some((item) => item.href === activeHref);
            const pagesId = `${baseId}-${groupIndex}-${index}`;
            return (
              <li key={entry.label}>
                <button
                  type="button"
                  className={`platform-side-nav__entry${holdsCurrent ? " platform-side-nav__entry_state_holding" : ""}`}
                  aria-expanded={isOpen}
                  aria-controls={pagesId}
                  onClick={() => toggle(entry.label)}
                >
                  {art}
                  <span className="platform-side-nav__label">{entry.label}</span>
                  <AngleDownIcon
                    variant="classic-solid"
                    className={`platform-side-nav__chevron${isOpen ? " platform-side-nav__chevron_state_open" : ""}`}
                  />
                </button>
                <div
                  id={pagesId}
                  className={`platform-side-nav__pages${isOpen ? " platform-side-nav__pages_state_open" : ""}`}
                  inert={!isOpen}
                >
                  <ul className="platform-side-nav__page-list">
                    {entry.items.map((item) => {
                      const isActive = item.href === activeHref;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`platform-side-nav__page${isActive ? " platform-side-nav__page_state_current" : ""}`}
                            aria-current={isActive ? "page" : undefined}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            );
          }),
        )}
      </ul>
    </nav>
  );
}
