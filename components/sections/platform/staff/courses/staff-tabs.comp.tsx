import Link from "next/link";
import "./staff-tabs.comp.css";

export interface StaffTab {
  label: string;
  href: string;
  /** A short fact next to the label: how many games there are, for instance. */
  count?: number;
}

interface StaffTabsProps {
  tabs: StaffTab[];
  /** The tab we are on; compared with `href`. */
  current: string;
}

/**
 * Internal navigation of a panel record: course and chapter are split into
 * tabs that are PAGES.
 *
 * They are links, not state: each tab has its URL, so it can be shared, the
 * back button works and each one loads only its data — a course's game list
 * is hundreds of rows and has no reason to travel every time someone comes
 * in to rename it.
 */
export function StaffTabs({ tabs, current }: StaffTabsProps) {
  return (
    <nav className="staff-tabs" aria-label="Secciones de la ficha">
      {tabs.map((tab) => {
        const isActive = tab.href === current;
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
