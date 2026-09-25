import Link from "next/link";
import type { StudySummary } from "@/services/studies/studies.types";
import { DeleteStudy } from "./delete-study.comp";
import "./study-card.comp.css";

interface StudyCardProps {
  study: StudySummary;
}

/**
 * The whole card takes you to the study: the name is the link, and a
 * pseudo-element of it is stretched over the card (see the stylesheet), which
 * keeps one link in the markup and the delete button, raised above it, still
 * pressable.
 */
export function StudyCard({ study }: StudyCardProps) {
  return (
    <article className="study-card">
      <span className="study-card__tile" aria-hidden="true" />

      <div className="study-card__body">
        <div className="study-card__head">
          <Link href={study.href} className="study-card__name">
            {study.name}
          </Link>

          {study.permissions.canDelete ? (
            <div className="study-card__actions">
              <DeleteStudy
                id={study.id}
                name={study.name}
                gameCount={study.gameCount}
                citedGameCount={study.citedGameCount}
              />
            </div>
          ) : (
            !study.permissions.canEditGames && <span className="study-card__readonly">Sólo lectura</span>
          )}
        </div>

        {/* Kind, size, where it comes from when it is not theirs, and how long ago
            it was touched: one line, like the byline of a lichess study. */}
        <p className="study-card__meta">
          <span className="study-card__kind">{study.kindLabel}</span>
          <span className="study-card__dot">·</span>
          <span>
            {study.gameCount} {study.gameCount === 1 ? "partida" : "partidas"}
          </span>
          {(study.courseName || study.sharedByName) && (
            <>
              <span className="study-card__dot">·</span>
              <span className="study-card__origin">{study.courseName ?? study.sharedByName}</span>
            </>
          )}
          <span className="study-card__dot">·</span>
          <span title={`Actualizado el ${study.updatedAtLabel}`}>{study.updatedAgoLabel}</span>
        </p>

        {study.description && <p className="study-card__description">{study.description}</p>}

        {study.previewGames.length > 0 && (
          <ul className="study-card__games">
            {study.previewGames.map((game, index) => (
              <li key={index} className="study-card__game">
                {game}
              </li>
            ))}
            {study.gameCount > study.previewGames.length && (
              <li className="study-card__game study-card__game_more">
                y {study.gameCount - study.previewGames.length} más
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}
