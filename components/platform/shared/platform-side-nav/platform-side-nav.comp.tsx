import Link from "next/link";
import type { ComponentType } from "react";
import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { GraduationCapIcon } from "@/components/icons/graduation-cap-icon.comp";
import type { IconProps } from "@/components/icons/icon-variant.const";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import "./platform-side-nav.comp.css";

/** The drawings a link can carry, by their Font Awesome names. */
const ICONS = {
  "book-open": BookOpenIcon,
  "circle-check": CircleCheckIcon,
  clock: ClockIcon,
  "graduation-cap": GraduationCapIcon,
  play: PlayIcon,
} satisfies Record<string, ComponentType<IconProps>>;

export type PlatformSideNavIcon = keyof typeof ICONS;

export interface PlatformSideNavLink {
  label: string;
  href: string;
  /** How many there are behind it, at the right end. */
  count?: number;
  /** The view on screen: lit, and `aria-current`. */
  current?: boolean;
  /** A drawing before the label. */
  icon?: PlatformSideNavIcon;
  /** Instead of a drawing, a dot in a course level's colour (1 the easiest). */
  level?: number;
}

export interface PlatformSideNavGroup {
  title: string;
  links: PlatformSideNavLink[];
}

interface PlatformSideNavProps {
  /** The nav's accessible name: what its links choose among. */
  label: string;
  /** The page's main action, on top as Material 3's extended button. */
  action?: { label: string; href: string };
  groups: PlatformSideNavGroup[];
}

/**
 * The side column of a page moved to the new design system (2026-10-22,
 * Material 3 as Gmail draws its labels): the page's main action on top, and
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
      {action && (
        <Link href={action.href} className="platform-side-nav__action">
          <PlayIcon variant="classic-solid" className="platform-side-nav__action-icon" />
          {action.label}
        </Link>
      )}

      {groups.map((group) => (
        <div key={group.title} className="platform-side-nav__group">
          <p className="platform-side-nav__title">{group.title}</p>
          <ul className="platform-side-nav__list">
            {group.links.map((link) => {
              const Icon = link.icon ? ICONS[link.icon] : undefined;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`platform-side-nav__link${link.current ? " platform-side-nav__link_state_current" : ""}`}
                    aria-current={link.current ? "page" : undefined}
                  >
                    {Icon && (
                      <Icon
                        variant={link.current ? "classic-solid" : "duotone-light"}
                        className="platform-side-nav__icon"
                      />
                    )}
                    {link.level !== undefined && (
                      <span
                        className={`platform-side-nav__level platform-side-nav__level_tone_${link.level}`}
                        aria-hidden="true"
                      />
                    )}
                    <span className="platform-side-nav__label">{link.label}</span>
                    {link.count !== undefined && <span className="platform-side-nav__count">{link.count}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
