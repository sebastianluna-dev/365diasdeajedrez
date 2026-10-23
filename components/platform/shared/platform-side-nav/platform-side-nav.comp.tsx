import Link from "next/link";
import type { ComponentType } from "react";
import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { BooksIcon } from "@/components/icons/books-icon.comp";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { ChalkboardUserIcon } from "@/components/icons/chalkboard-user-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ChessBoardIcon } from "@/components/icons/chess-board-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { CircleQuestionIcon } from "@/components/icons/circle-question-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { GraduationCapIcon } from "@/components/icons/graduation-cap-icon.comp";
import type { IconProps } from "@/components/icons/icon-variant.const";
import { LayerGroupIcon } from "@/components/icons/layer-group-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { RotateLeftIcon } from "@/components/icons/rotate-left-icon.comp";
import { ShuffleIcon } from "@/components/icons/shuffle-icon.comp";
import { StopwatchIcon } from "@/components/icons/stopwatch-icon.comp";
import { TagIcon } from "@/components/icons/tag-icon.comp";
import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import { UserGraduateIcon } from "@/components/icons/user-graduate-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
import { mdFab } from "@/lib/material/material-classes";
import "./platform-side-nav.comp.css";

/** The drawings a link can carry, by their Font Awesome names. */
const ICONS = {
  "book-open": BookOpenIcon,
  books: BooksIcon,
  calendar: CalendarIcon,
  "chalkboard-user": ChalkboardUserIcon,
  "chess-board": ChessBoardIcon,
  "circle-check": CircleCheckIcon,
  "circle-question": CircleQuestionIcon,
  clock: ClockIcon,
  "graduation-cap": GraduationCapIcon,
  "layer-group": LayerGroupIcon,
  play: PlayIcon,
  "rotate-left": RotateLeftIcon,
  shuffle: ShuffleIcon,
  stopwatch: StopwatchIcon,
  tag: TagIcon,
  trophy: TrophyIcon,
  user: UserIcon,
  "user-graduate": UserGraduateIcon,
} satisfies Record<string, ComponentType<IconProps>>;

export type PlatformSideNavIcon = keyof typeof ICONS;

/**
 * The drawings pasted on Font Awesome's bare 512 box instead of the padded
 * one the rest use (682.67, with the drawing a quarter smaller inside): at
 * the same 18px they would read a size up, so they are drawn at three
 * quarters (2026-10-22, the owner saw «Completados» larger than the rest).
 */
const TIGHT_BOX: ReadonlySet<PlatformSideNavIcon> = new Set(["circle-check"]);

export interface PlatformSideNavLink {
  label: string;
  href: string;
  /** How many there are behind it, at the right end: a number, or a ratio such as «1/3». */
  count?: number | string;
  /** The view on screen: lit, and `aria-current`. */
  current?: boolean;
  /** A drawing before the label. */
  icon?: PlatformSideNavIcon;
  /** Instead of a drawing, a dot in a course level's colour (1 the easiest). */
  level?: number;
  /**
   * Instead of a drawing, a small round badge: a chapter's number, or a
   * check once it is `done`.
   */
  badge?: { text: string; done?: boolean };
  /**
   * One of a group of which exactly one is on — an order, say —: a ring
   * before the label, filled on the one that is `current`, as a radio is.
   */
  choice?: boolean;
  /**
   * The views inside this one, drawn under it, indented and without a
   * drawing, the link itself in bold: a topic opened onto its subtopics.
   */
  subLinks?: PlatformSideNavLink[];
  /**
   * After `subLinks`, a last row that shows the rest of them («Ver los 19
   * subtemas»): a button, so only a Client Component host can hand it.
   */
  subMore?: { label: string; onSelect: () => void };
}

/** The page's main action, on top as Material 3's extended FAB. */
export interface PlatformSideNavAction {
  label: string;
  href: string;
  /** Its drawing, by its Font Awesome name; `play` when none is given. */
  icon?: PlatformSideNavIcon;
  /** The view it leads to is on screen: filled with the primary, and `aria-current`. */
  current?: boolean;
}

export interface PlatformSideNavGroup {
  /** The group's heading; without one, its links stand alone at the top (a page's views). */
  title?: string;
  links: PlatformSideNavLink[];
}

interface PlatformSideNavProps {
  /** The nav's accessible name: what its links choose among. */
  label: string;
  /** The page's main action, on top as Material 3's extended button. */
  action?: PlatformSideNavAction;
  groups: PlatformSideNavGroup[];
}

/**
 * The side column of a page moved to the new design system (2026-10-22,
 * Material 3 as Gmail draws its labels): the page's main action on top as Material's extended FAB (`mdFab`), and
 * under it its views in groups, each a link with its count, the one on
 * screen lit in the secondary container with its right end round. What it
 * holds is the page's — its filters, its catalog —, never the platform's
 * navigation, which is the tools menu.
 *
 * The links are links: a view lives in the address, so it can be shared and
 * the back button undoes it, as `FilterPills` does.
 */
export function PlatformSideNav({ label, action, groups }: PlatformSideNavProps) {
  return (
    <nav className="platform-side-nav" aria-label={label}>
      {action && <SideNavAction action={action} />}

      {groups.map((group) => (
        <div key={group.title ?? ""} className="platform-side-nav__group">
          {group.title && <p className="platform-side-nav__title">{group.title}</p>}
          <ul className="platform-side-nav__list">
            {group.links.map((link) => (
              <SideNavItem key={link.href} link={link} />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SideNavAction({ action }: { action: PlatformSideNavAction }) {
  const Icon = action.icon ? ICONS[action.icon] : PlayIcon;
  return (
    <Link
      href={action.href}
      className={`${mdFab(action.current ? "primary" : "primary-container")} platform-side-nav__action`}
      aria-current={action.current ? "page" : undefined}
    >
      <Icon variant="classic-solid" className="platform-md-icon" />
      {action.label}
    </Link>
  );
}

/** One row of a group, and the rows inside it when it is open. */
function SideNavItem({ link, sub = false }: { link: PlatformSideNavLink; sub?: boolean }) {
  const Icon = link.icon && !sub ? ICONS[link.icon] : undefined;
  const open = !sub && link.subLinks !== undefined && link.subLinks.length > 0;
  const className = [
    "platform-side-nav__link",
    sub && "platform-side-nav__link_kind_sub",
    open && "platform-side-nav__link_state_open",
    link.current && "platform-side-nav__link_state_current",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li>
      <Link href={link.href} className={className} aria-current={link.current ? "page" : undefined}>
        {Icon && (
          <Icon
            variant={link.current ? "classic-solid" : "duotone-light"}
            className={`platform-side-nav__icon${link.icon && TIGHT_BOX.has(link.icon) ? " platform-side-nav__icon_box_tight" : ""}`}
          />
        )}
        {link.badge && (
          <span
            className={`platform-side-nav__badge${link.badge.done ? " platform-side-nav__badge_state_done" : ""}`}
            aria-hidden="true"
          >
            {link.badge.done ? (
              <CheckIcon variant="classic-solid" className="platform-side-nav__badge-check" />
            ) : (
              link.badge.text
            )}
          </span>
        )}
        {link.choice && (
          <span
            className={`platform-side-nav__choice${link.current ? " platform-side-nav__choice_state_on" : ""}`}
            aria-hidden="true"
          />
        )}
        {link.level !== undefined && (
          <span className={`platform-side-nav__level platform-side-nav__level_tone_${link.level}`} aria-hidden="true" />
        )}
        <span className="platform-side-nav__label">{link.label}</span>
        {link.count !== undefined && <span className="platform-side-nav__count">{link.count}</span>}
      </Link>
      {open && (
        <ul className="platform-side-nav__list">
          {link.subLinks?.map((child) => (
            <SideNavItem key={child.href} link={child} sub />
          ))}
          {link.subMore && (
            <li>
              <button type="button" className="platform-side-nav__more" onClick={link.subMore.onSelect}>
                {link.subMore.label}
              </button>
            </li>
          )}
        </ul>
      )}
    </li>
  );
}
