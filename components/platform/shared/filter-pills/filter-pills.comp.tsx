import Link from "next/link";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import "./filter-pills.comp.css";

export interface FilterPill {
  label: string;
  href: string;
  /** A count beside the label: «Por finalizar 3». */
  count?: number;
  active: boolean;
}

interface FilterPillsProps {
  /** What is being filtered, as the nav's accessible name: «Vista», «Estado». */
  label: string;
  pills: FilterPill[];
}

/**
 * A row of filters that are links: each pill changes the address, so the
 * filter can be shared and the back button undoes it. The active one is in
 * the accent's tint with a tick and `aria-current`. A filter, not a form: it
 * never validates nor errs, so its focus is the accent's.
 */
export function FilterPills({ label, pills }: FilterPillsProps) {
  return (
    <nav className="filter-pills" aria-label={label}>
      {pills.map((pill) => (
        <Link
          key={pill.href}
          href={pill.href}
          aria-current={pill.active ? "page" : undefined}
          className={`filter-pills__pill${pill.active ? " filter-pills__pill_state_active" : ""}`}
        >
          {pill.active && <CheckIcon variant="classic-solid" className="filter-pills__check" />}
          {pill.label}
          {pill.count !== undefined && <span className="filter-pills__count">{pill.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
