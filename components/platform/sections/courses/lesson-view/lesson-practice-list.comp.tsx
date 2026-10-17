import Link from "next/link";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import type { LessonPractice } from "@/services/exercises/lesson-practice.types";
import "./lesson-practice-list.comp.css";

interface LessonPracticeListProps {
  /** The lesson's name and whether it is a priority: the head, as the viewer's would be. */
  title: string;
  badge?: string;
  description?: string;
  practice: LessonPractice;
  /**
   * The way through, as the viewer's `onwards`: «Saltar» to the next lesson
   * while the exercises are not all solved, and «Continuar», which gives the
   * lesson for read, once they are — or always, since the exercises are
   * optional (D26); the solved ones only change which button is the accent.
   */
  onwards: {
    skipHref?: string;
    skipLabel: string;
    skipTitle?: string;
    finishLabel: string;
    finish: () => Promise<void>;
  };
}

/**
 * A practice-only lesson (D25): no game to read, so its exercises stand
 * where the board would be — the lesson's head, its description, the way in
 * as the one accent, and the exercises in order, each the start position
 * small, its title and facts, and «Resuelto» when any row of its family is.
 * Under them, the lesson's way through.
 */
export function LessonPracticeList({ title, badge, description, practice, onwards }: LessonPracticeListProps) {
  const standing = `${practice.solved} de ${practice.total} ${practice.total === 1 ? "resuelto" : "resueltos"}`;
  return (
    <section className="lesson-practice-list" aria-label="Ejercicios de la lección">
      <header className="lesson-practice-list__head">
        <h1 className="lesson-practice-list__title">
          {title}
          {badge && (
            <span className="platform-tag platform-tag_variant_accent lesson-practice-list__badge">{badge}</span>
          )}
        </h1>
        <p className="lesson-practice-list__standing">
          {practice.total} {practice.total === 1 ? "ejercicio" : "ejercicios"} · {standing}
        </p>
        {description && <p className="lesson-practice-list__description">{description}</p>}
        {practice.start && (
          <Link
            href={practice.start.href}
            className="platform-button platform-button_variant_accent platform-button_size_lg lesson-practice-list__start"
          >
            {practice.start.label}
          </Link>
        )}
      </header>

      <ol className="lesson-practice-list__list">
        {practice.items.map((item) => (
          <li key={item.n} className="lesson-practice-list__item">
            <Link href={item.href} className="lesson-practice-list__link">
              <span className="lesson-practice-list__diagram">
                <StaticDiagram fen={item.startFen} orientation={item.orientation} />
              </span>
              <span className="lesson-practice-list__body">
                <span className="lesson-practice-list__item-title">
                  {item.n}. {item.title}
                </span>
                <span className="lesson-practice-list__facts">{item.facts}</span>
              </span>
              {item.solved && (
                <span className="lesson-practice-list__mark">
                  <CircleCheckIcon variant="classic-solid" className="lesson-practice-list__mark-icon" />
                  Resuelto
                </span>
              )}
            </Link>
          </li>
        ))}
      </ol>

      {/* The lesson's way through, as under a board: the exercises are optional (D26), so «Continuar» is always there. */}
      <div className="lesson-practice-list__onwards">
        {onwards.skipHref && (
          <Link href={onwards.skipHref} title={onwards.skipTitle} className="platform-button platform-button_size_lg">
            {onwards.skipLabel}
          </Link>
        )}
        <form action={onwards.finish}>
          <button
            type="submit"
            className={`platform-button platform-button_size_lg${practice.start ? "" : " platform-button_variant_accent"}`}
          >
            {onwards.finishLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
