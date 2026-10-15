import Link from "next/link";
import { CalendarUsersIcon } from "@/components/icons/calendar-users-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { FileMinusIcon } from "@/components/icons/file-minus-icon.comp";
import { GiftIcon } from "@/components/icons/gift-icon.comp";
import { HandHoldingDollarIcon } from "@/components/icons/hand-holding-dollar-icon.comp";
import { LinkSlashIcon } from "@/components/icons/link-slash-icon.comp";
import { LockIcon } from "@/components/icons/lock-icon.comp";
import { PenLineIcon } from "@/components/icons/pen-line-icon.comp";
import { ClassDateTile } from "@/components/platform/shared/class-date-tile/class-date-tile.comp";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { dayKeyIn } from "@/lib/timezone";
import { formatClassHours } from "@/lib/format-class-when";
import type { ClassRowChipIcon, ClassRowData } from "./class-row.types";
import "./class-row.comp.css";

interface ClassRowProps {
  row: ClassRowData;
  /** Whose list it is: the words of the tag and the chips differ. */
  audience: "staff" | "teacher";
}

const CHIP_ICONS: Record<ClassRowChipIcon, typeof LinkSlashIcon> = {
  "no-link": LinkSlashIcon,
  unpaid: HandHoldingDollarIcon,
  free: GiftIcon,
  group: CalendarUsersIcon,
  prepare: EyeIcon,
  after: ClockIcon,
  script: LockIcon,
  "no-content": FileMinusIcon,
  "no-topic": PenLineIcon,
};

/**
 * One class in a list of the staff or the teacher: the date as a tile with
 * the hours, the phase, the topic and who is in it, what the reader should
 * know at a glance (chips) and an action. The title is the link, stretched
 * over the whole row, and the action sits above it; nothing interactive is
 * nested. A card under 640px.
 */
export function ClassRow({ row, audience }: ClassRowProps) {
  const start = new Date(row.startIso);
  const now = new Date(row.nowIso);
  const isToday = dayKeyIn(start, row.timeZone) === dayKeyIn(now, row.timeZone);

  return (
    <div className="class-row">
      <div className="class-row__when">
        <ClassDateTile startIso={row.startIso} timeZone={row.timeZone} isToday={isToday} size="sm" />
        <time dateTime={row.startIso} className="class-row__hours">
          {formatClassHours(start, row.durationMin, row.timeZone)}
        </time>
      </div>
      <div className="class-row__status">
        <ClassStatusTag phase={row.phase} audience={audience} />
      </div>
      <div className="class-row__what">
        <Link href={row.href} className="class-row__title">
          {row.title}
        </Link>
        <p className="class-row__people">{row.people}</p>
      </div>
      {row.chips.length > 0 && (
        <ul className="class-row__chips" aria-label="Avisos">
          {row.chips.map((chip) => {
            const Icon = CHIP_ICONS[chip.icon];
            return (
              <li
                key={`${chip.icon}:${chip.label}`}
                className={`class-row__chip${chip.tone && chip.tone !== "neutral" ? ` class-row__chip_tone_${chip.tone}` : ""}`}
              >
                <Icon variant="classic-solid" className="class-row__chip-icon" />
                {chip.label}
              </li>
            );
          })}
        </ul>
      )}
      <div className="class-row__action">
        {row.action ? (
          <Link href={row.action.href} className="platform-row-action">
            {row.action.label}
          </Link>
        ) : (
          <ChevronRightIcon variant="classic-solid" className="class-row__chevron" />
        )}
      </div>
    </div>
  );
}
