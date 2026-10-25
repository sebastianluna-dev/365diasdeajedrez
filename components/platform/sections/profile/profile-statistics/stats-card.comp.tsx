import Link from "next/link";
import { useId, type ComponentType, type ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons/arrow-up-right-icon.comp";
import { ChartSimpleIcon } from "@/components/icons/chart-simple-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { FireIcon } from "@/components/icons/fire-icon.comp";
import type { IconProps } from "@/components/icons/icon-variant.const";
import { LightbulbIcon } from "@/components/icons/lightbulb-icon.comp";
import { RobotIcon } from "@/components/icons/robot-icon.comp";
import { RotateLeftIcon } from "@/components/icons/rotate-left-icon.comp";
import { TagIcon } from "@/components/icons/tag-icon.comp";
import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import { mdIconButton } from "@/lib/material/material-classes";
import "./stats-card.comp.css";

/** The drawings a card's head can carry, by their Font Awesome names. */
const ICONS = {
  "chart-simple": ChartSimpleIcon,
  "circle-check": CircleCheckIcon,
  clock: ClockIcon,
  fire: FireIcon,
  lightbulb: LightbulbIcon,
  robot: RobotIcon,
  "rotate-left": RotateLeftIcon,
  tag: TagIcon,
  trophy: TrophyIcon,
} satisfies Record<string, ComponentType<IconProps>>;

export type StatsCardIcon = keyof typeof ICONS;

interface StatsCardProps {
  icon: StatsCardIcon;
  title: string;
  /** Under the title, small: what the figures are of. */
  subtitle?: string;
  /** The round arrow at the head's right: where to see more («Ver tu actividad»). */
  link?: { label: string; href: string };
  /** The line under the chart that says what it reads, in the student's words. */
  reads: string;
  /** `hero` the wide card of a tab's first chart; `plain` one of the row under it. */
  size?: "hero" | "plain";
  /** The chart: the card only places it under its head and over its line. */
  children: ReactNode;
}

/**
 * A card of «Estadísticas» (2026-10-25, the owner's «Estadísticas · C»): on
 * the container's grey with Material's extra-large corners, its head — the
 * drawing in a ring, the title and what it is of, the round arrow to see
 * more — over the chart it is given, and under it the line that says what
 * the chart reads. A section named by its title.
 */
export function StatsCard({ icon, title, subtitle, link, reads, size = "plain", children }: StatsCardProps) {
  const id = useId();
  const Icon = ICONS[icon];
  return (
    <section className={`stats-card stats-card_size_${size}`} aria-labelledby={id}>
      <div className="stats-card__head">
        <span className={`stats-card__icon stats-card__icon_name_${icon}`} aria-hidden="true">
          <Icon variant={icon === "fire" ? "duotone-solid" : "duotone-light"} className="stats-card__glyph" />
        </span>
        <div className="stats-card__titles">
          <h2 id={id} className="stats-card__title">
            {title}
          </h2>
          {subtitle && <p className="stats-card__subtitle">{subtitle}</p>}
        </div>
        {link && (
          <Link href={link.href} className={`${mdIconButton("standard", "xs")} stats-card__link`} aria-label={link.label}>
            <ArrowUpRightIcon variant="classic-solid" className="platform-md-icon" />
          </Link>
        )}
      </div>
      <div className="stats-card__body">{children}</div>
      <p className="stats-card__reads">{reads}</p>
    </section>
  );
}
