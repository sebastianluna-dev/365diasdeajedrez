"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state.comp";
import type { StudySummary } from "@/services/studies/studies.types";
import { StudyCard } from "./study-card.comp";
import "./studies-browser.comp.css";

const ALL = "Todos";

interface StudiesBrowserProps {
  /** Los tuyos, incluida la tarjeta de partidas de clase. */
  own: StudySummary[];
  /** Las bases de los cursos que has empezado. Sólo lectura. */
  course: StudySummary[];
}

export function StudiesBrowser({ own, course }: StudiesBrowserProps) {
  const [active, setActive] = useState(ALL);

  // Los filtros salen de los tipos que hay delante, no de una lista fija: si
  // mañana aparece un repertorio, su filtro aparece solo.
  const options = useMemo(() => {
    const labels = [...own, ...course].map((study) => study.kindLabel);
    return [ALL, ...[...new Set(labels)]];
  }, [own, course]);

  const matches = (study: StudySummary) => active === ALL || study.kindLabel === active;
  const ownShown = own.filter(matches);
  const courseShown = course.filter(matches);
  const total = ownShown.length + courseShown.length;

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
          {total} de {own.length + course.length} estudios
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

      {courseShown.length > 0 && (
        <section className="studies-browser__group">
          <h2 className="studies-browser__group-title">Bases de tus cursos</h2>
          <div className="studies-browser__grid">
            {courseShown.map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
