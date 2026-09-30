"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { StaffTab } from "./staff-tabs.const";
import "./staff-tabs.comp.css";

interface StaffTabsProps {
  tabs: StaffTab[];
}

/**
 * Internal navigation of a panel record: course and chapter are split into
 * tabs that are PAGES.
 *
 * They are links, not state: each tab has its URL, so it can be shared, the
 * back button works and each one loads only its data — a course's game list
 * is hundreds of rows and has no reason to travel every time someone comes
 * in to rename it.
 *
 * The only client component of the record's header, and for one reason: the
 * header lives in the LAYOUT of the three pages, and a layout is not rendered
 * again when one navigates between its children, so it cannot be told which
 * tab is the current one. The address is read here instead.
 */
export function StaffTabs({ tabs }: StaffTabsProps) {
  const pathname = usePathname();

  return (
    <nav className="staff-tabs" aria-label="Secciones de la ficha">
      {tabs.map((tab) => {
        const isActive = tab.href === pathname;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`staff-tabs__tab${isActive ? " staff-tabs__tab_state_active" : ""}`}
          >
            {tab.label}
            {tab.count !== undefined && <span className="staff-tabs__count">{tab.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
