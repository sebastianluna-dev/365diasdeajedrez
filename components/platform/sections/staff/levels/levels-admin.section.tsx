import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { ELO_DISCLAIMER, LEVEL_CATALOG_NOTE } from "@/constants/platform/course-levels.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import type { LevelAdminRow } from "@/services/staff-levels/staff-levels.types";
import { LevelForm } from "./level-form.comp";
import "./levels-admin.section.css";

interface LevelsAdminSectionProps {
  /** Every level, retired ones included, the easiest first. */
  levels: LevelAdminRow[];
  errorCode?: string;
}

/**
 * The catalog of levels a course is aimed at: a summary of the ranges as the
 * student reads them, one form per level — saving one never touches another —
 * and the form that creates a new one at the end, where it lands by default.
 * Like authors and entities, a level is never deleted: it is retired.
 */
export function LevelsAdminSection({ levels, errorCode }: LevelsAdminSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="levels-admin">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <section className="levels-admin__summary platform-card" aria-labelledby="levels-admin-summary-title">
        <h2 id="levels-admin-summary-title" className="platform-card__title">
          Rangos orientativos
        </h2>

        {levels.length > 0 ? (
          <table className="levels-admin__table">
            <thead>
              <tr>
                <th scope="col">Nivel</th>
                <th scope="col">Elo orientativo</th>
                <th scope="col">Descripción</th>
                <th scope="col" className="levels-admin__number">
                  Cursos
                </th>
              </tr>
            </thead>
            <tbody>
              {levels.map((level) => (
                <tr key={level.id} className={level.isActive ? undefined : "levels-admin__line_state_retired"}>
                  <th scope="row">
                    {level.name}
                    {!level.isActive && <span className="platform-tag levels-admin__retired">Retirado</span>}
                  </th>
                  <td className="levels-admin__range">{level.eloRange}</td>
                  <td>{level.description}</td>
                  <td className="levels-admin__number">{level.courseCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="levels-admin__empty">Todavía no hay niveles. Crea el primero más abajo.</p>
        )}

        <p className="levels-admin__note">{LEVEL_CATALOG_NOTE}</p>
        <p className="levels-admin__note">Junto a los rangos, el alumno siempre lee: «{ELO_DISCLAIMER}».</p>
      </section>

      {levels.map((level) => (
        <section key={level.id} className="levels-admin__level platform-card" aria-label={`Nivel ${level.name}`}>
          <h3 className="levels-admin__level-title">
            {level.name}
            <span className="levels-admin__level-meta">
              {level.eloRange} · {level.courseCount} curso{level.courseCount === 1 ? "" : "s"}
            </span>
            {!level.isActive && <span className="platform-tag levels-admin__retired">Retirado</span>}
          </h3>

          <LevelForm level={level} />
        </section>
      ))}

      <section className="levels-admin__level platform-card" aria-labelledby="levels-admin-create-title">
        <h2 id="levels-admin-create-title" className="platform-card__title">
          Nuevo nivel
        </h2>

        <LevelForm />
      </section>
    </div>
  );
}
