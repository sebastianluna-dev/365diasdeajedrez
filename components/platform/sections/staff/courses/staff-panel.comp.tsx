import type { ReactNode } from "react";
import "./staff-panel.comp.css";

interface StaffPanelProps {
  title: string;
  /** A short fact next to the title: "5 capítulos · 162 lecciones". */
  meta?: string;
  /** The card's action, aligned to the right edge of its header. */
  action?: ReactNode;
  /** Context sentence under the header, when the card does not explain itself. */
  description?: string;
  children: ReactNode;
}

/**
 * A card of the courses panel: header with title, fact and action, and the
 * content below.
 *
 * The header carries its own full-width rule — with negative margins that
 * cancel the padding — because a line that does not reach the edges reads as
 * an underline of the title instead of as the card's division.
 */
export function StaffPanel({ title, meta, action, description, children }: StaffPanelProps) {
  return (
    <section className="staff-panel">
      <header className="staff-panel__head">
        <h2 className="staff-panel__title">{title}</h2>
        {meta && <span className="staff-panel__meta">{meta}</span>}
        {action && <div className="staff-panel__action">{action}</div>}
      </header>

      {description && <p className="staff-panel__description">{description}</p>}

      {children}
    </section>
  );
}
