"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state.comp";
import type { StudySummary } from "@/services/studies/studies.types";
import { StudyCard } from "./study-card.comp";
import "./studies-browser.comp.css";

const ALL = "Todos";

interface StudiesBrowserProps {
  /** Los que son suyos: «Mis partidas», sus torneos y sus estudios. */
  own: StudySummary[];
  /**
   * Lo que le llega hecho y no puede tocar: las bases de los cursos que ha
   * empezado, las colecciones que le repartió un maestro y las partidas de sus
   * clases.
   */
  received: StudySummary[];
}

export function StudiesBrowser({ own, received }: StudiesBrowserProps) {
  const [active, setActive] = useState(ALL);

  // Los filtros salen de los tipos que hay delante, no de una lista fija: si
  // mañana aparece otro tipo, su filtro aparece solo.
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

        <span className="studies-browser__count">
          {total} de {own.length + received.length} estudios
        </span>
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
