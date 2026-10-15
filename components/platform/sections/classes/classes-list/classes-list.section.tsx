import Link from "next/link";
import { ClassCard, UnscheduledClassCard } from "@/components/platform/shared/class-card/class-card.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { StudentClassesView } from "@/services/classes/classes.types";
import "./classes-list.section.css";

interface ClassesListSectionProps {
  view: StudentClassesView;
  /** How many pages of past classes are shown; «Ver más» asks for one more. */
  pastPages: number;
}

/**
 * «Mis clases» (ALU-1): today's classes featured, the next ones as rows with
 * the classes bought without a date among them, and the past ones by month,
 * ten at a time. A month that is one payment, spent, folds into one line.
 * The balance is the page's: it goes in the lane beside this.
 */
export function ClassesListSection({ view, pastPages }: ClassesListSectionProps) {
  const nothing =
    view.today.length === 0 && view.upcoming.length === 0 && view.unscheduled.length === 0 && view.past.length === 0;

  if (nothing) {
    return (
      <div className="classes-list">
        <EmptyState
          title="No tienes clases programadas"
          description="Cuando administración programe una clase contigo, aparecerá aquí con su fecha y su enlace."
        />
      </div>
    );
  }

  return (
    <div className="classes-list">
      {view.today.length > 0 && (
        <section className="classes-list__group" aria-labelledby="clases-hoy">
          <h2 id="clases-hoy" className="classes-list__group-title">
            Hoy
          </h2>
          <div className="classes-list__items">
            {view.today.map((card) => (
              <ClassCard key={card.id} card={card} variant="featured" />
            ))}
          </div>
        </section>
      )}

      <section className="classes-list__group" aria-labelledby="clases-proximas">
        <h2 id="clases-proximas" className="classes-list__group-title">
          Próximas
        </h2>
        {view.upcoming.length > 0 || view.unscheduled.length > 0 ? (
          <div className="classes-list__items">
            {view.upcoming.map((card) => (
              <ClassCard
                key={card.id}
                card={card}
                variant={view.today.length === 0 && card === view.upcoming[0] ? "featured" : "compact"}
              />
            ))}
            {view.unscheduled.map((item, index) => (
              <UnscheduledClassCard key={`${item.paymentId}-${index}`} item={item} />
            ))}
          </div>
        ) : (
          <p className="classes-list__empty">
            No tienes más clases programadas. Cuando administración programe una contigo, aparecerá aquí.
          </p>
        )}
      </section>

      {view.past.length > 0 && (
        <section className="classes-list__group" aria-labelledby="clases-pasadas">
          <h2 id="clases-pasadas" className="classes-list__group-title">
            Pasadas
          </h2>
          {view.past.map((month) => (
            <div key={month.key} className="classes-list__month">
              <h3 className="classes-list__month-title">{month.label}</h3>
              {month.foldedLabel ? (
                <details className="classes-list__folded">
                  <summary className="classes-list__folded-summary">{month.foldedLabel}</summary>
                  <div className="classes-list__items">
                    {month.cards.map((card) => (
                      <ClassCard key={card.id} card={card} variant="compact" />
                    ))}
                  </div>
                </details>
              ) : (
                <div className="classes-list__items">
                  {month.cards.map((card) => (
                    <ClassCard key={card.id} card={card} variant="compact" />
                  ))}
                </div>
              )}
            </div>
          ))}
          {view.pastShown < view.pastTotal && (
            <p className="classes-list__more">
              <Link
                href={`${platformRoutes.classes}?pasadas=${pastPages + 1}#clases-pasadas`}
                className="platform-button"
              >
                Ver más
              </Link>
              <span className="classes-list__more-count">
                {view.pastShown} de {view.pastTotal}
              </span>
            </p>
          )}
        </section>
      )}
    </div>
  );
}
