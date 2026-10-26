import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import "./site-chips.comp.css";

const ICONS = { check: CheckIcon, clock: ClockIcon, calendar: CalendarIcon, users: UsersIcon };

export type SiteChipIcon = keyof typeof ICONS;

interface SiteChipsProps {
  /** What the list is, said to a screen reader («Así son las clases»). */
  label: string;
  chips: { icon: SiteChipIcon; text: string }[];
}

/**
 * A row of short promises drawn as Material's outlined chips on white
 * («Clases que no caducan», «Individual o grupal»), each with its blue icon.
 * They say something and are not pressed, so they are a list and not buttons.
 */
export function SiteChips({ label, chips }: SiteChipsProps) {
  return (
    <ul className="site-chips" aria-label={label}>
      {chips.map((chip) => {
        const Icon = ICONS[chip.icon];
        return (
          <li key={chip.text} className="site-chips__chip">
            <Icon className="site-chips__icon" />
            {chip.text}
          </li>
        );
      })}
    </ul>
  );
}
