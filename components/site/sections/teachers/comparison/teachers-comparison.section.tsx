import type { ComponentType } from "react";
import { CalendarClockIcon } from "@/components/icons/calendar-clock-icon.comp";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ChessBoardIcon } from "@/components/icons/chess-board-icon.comp";
import { CircleHalfStrokeIcon } from "@/components/icons/circle-half-stroke-icon.comp";
import { CirclePlayIcon } from "@/components/icons/circle-play-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { FileIcon } from "@/components/icons/file-icon.comp";
import { GraduationCapIcon } from "@/components/icons/graduation-cap-icon.comp";
import { ListOlIcon } from "@/components/icons/list-ol-icon.comp";
import { TagIcon } from "@/components/icons/tag-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import type { IconProps } from "@/components/icons/icon-variant.const";
import {
  COMPARISON_COLUMNS,
  COMPARISON_MARK_LABEL,
  COMPARISON_ROWS,
  type ComparisonCell,
  type ComparisonIcon,
  type ComparisonMark,
} from "./comparison.const";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { mdButton } from "@/lib/material/material-classes";
import "./teachers-comparison.section.css";

const ROW_ICONS: Record<ComparisonIcon, ComponentType<IconProps>> = {
  calendar: CalendarClockIcon,
  list: ListOlIcon,
  tag: TagIcon,
  board: ChessBoardIcon,
  file: FileIcon,
  play: CirclePlayIcon,
  eye: EyeIcon,
  cap: GraduationCapIcon,
};

const MARK_ICONS: Record<ComparisonMark, ComponentType<IconProps>> = {
  yes: CheckIcon,
  no: XmarkIcon,
  part: CircleHalfStrokeIcon,
  soon: ClockIcon,
};

function Cell({ cell, column, ours = false }: { cell: ComparisonCell; column: string; ours?: boolean }) {
  const Icon = MARK_ICONS[cell.mark];
  return (
    <td className={`teachers-comparison__cell${ours ? " teachers-comparison__cell_ours" : ""}`} data-column={column}>
      <span className={`teachers-comparison__mark teachers-comparison__mark_value_${cell.mark}`}>
        <Icon className="teachers-comparison__mark-icon" variant="classic-solid" />
        {COMPARISON_MARK_LABEL[cell.mark]}
      </span>
      <span className="teachers-comparison__cell-text">{cell.text}</span>
    </td>
  );
}

/** «Profesores · Comparación A»: what three tools do today, and what the platform does in one. */
export function TeachersComparisonSection() {
  return (
    <SiteSection id="incluye" labelledBy="teachers-comparison-title">
      <div className="teachers-comparison">
        <div className="teachers-comparison__head">
          <div className="teachers-comparison__copy">
            <SiteEyebrow>
              <ListOlIcon variant="classic-solid" />
              Qué incluye
            </SiteEyebrow>
            <SiteHeading id="teachers-comparison-title" text="Lo que hoy haces con tres herramientas, en una" />
          </div>
          <a className={mdButton("filled", "md")} href="#demo">
            <CalendarIcon className="site-md-icon" variant="classic-solid" />
            Agenda una demo
          </a>
        </div>

        <div className="teachers-comparison__table-wrap">
          <table className="teachers-comparison__table">
            <caption className="teachers-comparison__caption">
              Comparación de WhatsApp con hojas de cálculo, Lichess o Chess.com y Plataforma Ajedrez 365 para dar clases
            </caption>
            <thead className="teachers-comparison__thead">
              <tr>
                <th scope="col" className="teachers-comparison__corner">
                  <span className="teachers-comparison__hidden">Qué</span>
                </th>
                {Object.entries(COMPARISON_COLUMNS).map(([key, column]) => (
                  <th
                    key={key}
                    scope="col"
                    className={`teachers-comparison__column${key === "ours" ? " teachers-comparison__column_ours" : ""}`}
                  >
                    {column.title}
                    <small className="teachers-comparison__column-note">{column.note}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => {
                const Icon = ROW_ICONS[row.icon];
                return (
                  <tr key={row.feature} className="teachers-comparison__row">
                    <th scope="row" className="teachers-comparison__feature">
                      <span className="teachers-comparison__feature-icon-wrap">
                        <Icon className="teachers-comparison__feature-icon" />
                      </span>
                      {row.feature}
                    </th>
                    <Cell cell={row.chat} column={COMPARISON_COLUMNS.chat.title} />
                    <Cell cell={row.sites} column={COMPARISON_COLUMNS.sites.title} />
                    <Cell cell={row.ours} column={COMPARISON_COLUMNS.ours.title} ours />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="teachers-comparison__foot">
          Comparamos lo que cada herramienta ofrece para llevar clases, no lo bien que se juega en ella. Lichess y
          Chess.com son marcas de sus dueños.
        </p>
      </div>
    </SiteSection>
  );
}
