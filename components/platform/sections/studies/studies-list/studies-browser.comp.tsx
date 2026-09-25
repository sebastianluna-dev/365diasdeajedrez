"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import type { StudySummary } from "@/services/studies/studies.types";
import { StudyCard } from "./study-card.comp";
import "./studies-browser.comp.css";

const ALL = "Todos";

interface StudiesBrowserProps {
  /** Those that are theirs: "Mis partidas", their tournaments and their studies. */
  own: StudySummary[];
  /**
   * What reaches them ready-made and cannot be touched: the databases of the
   * courses they have started, the collections a teacher handed them and the
   * games from their classes.
   */
  received: StudySummary[];
}

export function StudiesBrowser({ own, received }: StudiesBrowserProps) {
  const [active, setActive] = useState(ALL);

  // The filters come from the kinds that are present, not from a fixed list: if
  // another kind appears tomorrow, its filter appears by itself.
  const options = useMemo(() => {
    const labels = [...own, ...received].map((study) => study.kindLabel);
    return [ALL, ...[...new Set(labels)]];
  }, [own, received]);

  const matches = (study: StudySummary) => active === ALL || study.kindLabel === active;
  const ownShown = own.filter(matches);
  const receivedShown = received.filter(matches);
  const total = ownShown.length + receivedShown.length;

  return (
    <div className="studies-browser">
      <div className="studies-browser__filters">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setActive(option)}
            aria-pressed={option === active}
            className={`studies-browser__chip${option === active ? " studies-browser__chip_state_active" : ""}`}
          >
            {option}
          </button>
        ))}
      </div>

      {total === 0 && (
        <EmptyState
          title={`Ningún estudio de tipo «${active}»`}
          description="Prueba con otro filtro o crea uno nuevo."
        />
      )}

      {ownShown.length > 0 && (
        <section className="studies-browser__group">
          <h2 className="studies-browser__group-title">Tus estudios</h2>
          <div className="studies-browser__grid">
            {ownShown.map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>
        </section>
      )}

      {receivedShown.length > 0 && (
        <section className="studies-browser__group">
          <h2 className="studies-browser__group-title">Material que has recibido</h2>
          <div className="studies-browser__grid">
            {receivedShown.map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
