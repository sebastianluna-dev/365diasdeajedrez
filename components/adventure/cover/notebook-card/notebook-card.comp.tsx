import Link from "next/link";
import { useId } from "react";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon.comp";
import { LockIcon } from "@/components/icons/lock-icon.comp";
import { StarIcon } from "@/components/icons/star-icon.comp";
import { initialsOf } from "@/lib/avatar-tone";
import { platformRoutes } from "@/lib/platform-routes";
import type { AdventureProgressView, EncounterState, EncounterView } from "@/services/adventure/adventure.types";
import "@/components/adventure/adventure.css";
import "./notebook-card.comp.css";

interface NotebookCardProps {
  progress: AdventureProgressView;
}

const STATE_WORDS: Record<EncounterState, string> = {
  beaten: "superado",
  available: "disponible",
  locked: "bloqueado",
};

/** «1 estrella», «9 estrellas». */
function starsText(stars: number): string {
  return `${stars} ${stars === 1 ? "estrella" : "estrellas"}`;
}

/**
 * A rival's stamp: perforated paper with its initials until the portraits are
 * drawn. Beaten ones are postmarked, the available one is pinned, a locked one
 * only shows its padlock, and the final page is sealed with red wax.
 */
function NotebookStamp({ encounter, isLarge = false }: { encounter: EncounterView; isLarge?: boolean }) {
  const hidden = encounter.state === "locked";
  return (
    <span
      className={`notebook-card__stamp notebook-card__stamp_state_${encounter.state}${isLarge ? " notebook-card__stamp_size_large" : ""}${encounter.isFinal ? " notebook-card__stamp_final" : ""}`}
    >
      {hidden ? (
        <LockIcon variant="classic-solid" className="notebook-card__stamp-lock" />
      ) : (
        <span className="notebook-card__stamp-initials">{initialsOf(encounter.name)}</span>
      )}
      {isLarge && <span className="notebook-card__stamp-elo">{encounter.elo}</span>}
    </span>
  );
}

/**
 * The right-hand page of the cover's open notebook: the adventure's name and
 * premise, how far the person is, the next rival and the way in. Everything
 * is read from the progress; the only action is a link to the map (or to the
 * game that is open), and one to the shelf.
 */
export function NotebookCard({ progress }: NotebookCardProps) {
  const titleId = useId();
  const { current, openGame } = progress;
  const mapHref = platformRoutes.adventureMap(progress.slug);
  // An open game against this adventure's own rival is the thing to go on with;
  // a free game stays a line apart and the way in is still the map.
  const continuesGame = openGame !== null && progress.openGameEncounter !== null;
  const mapLabel = progress.isComplete
    ? "Abrir el mapa"
    : progress.beaten === 0
      ? "Empezar la aventura"
      : "Continuar la aventura";

  return (
    <article className="adventure notebook-card" aria-labelledby={titleId}>
      <p className="notebook-card__eyebrow">Modo aventura</p>
      <h2 className="notebook-card__title" id={titleId}>
        {progress.title}
      </h2>
      <p className="notebook-card__premise">{progress.premise}</p>

      <div className="notebook-card__progress">
        <p className="notebook-card__count">
          <strong className="notebook-card__figure">
            {progress.beaten} de {progress.total}
          </strong>
          <span>rivales superados</span>
          {progress.stars > 0 && (
            <span className="notebook-card__stars">
              <StarIcon variant="duotone-solid" className="notebook-card__star" />
              {starsText(progress.stars)}
            </span>
          )}
        </p>
        <ol className="notebook-card__stamps" aria-label="Los doce rivales de la aventura">
          {progress.encounters.map((encounter) => (
            <li key={encounter.order} className="notebook-card__stamp-item">
              <NotebookStamp encounter={encounter} />
              <span className="notebook-card__sr">
                Rival {encounter.order}, {STATE_WORDS[encounter.state]}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {current ? (
        <div className="notebook-card__next">
          {current.attempts > 0 && <span className="notebook-card__attempt">Intento {current.attempts + 1}</span>}
          <NotebookStamp encounter={current} isLarge />
          <div className="notebook-card__rival">
            <p className="notebook-card__next-label">Próximo rival · N.º {current.order}</p>
            <p className="notebook-card__name">{current.name}</p>
            <p className="notebook-card__role">{current.role}</p>
            <p className="notebook-card__meta">
              ≈ {current.elo} · {current.difficultyLabel} · {current.zoneName}
            </p>
          </div>
        </div>
      ) : (
        <div className="notebook-card__next notebook-card__next_complete">
          <div className="notebook-card__rival">
            <p className="notebook-card__next-label">Cuaderno completo</p>
            <p className="notebook-card__name">Las doce páginas están escritas</p>
            <p className="notebook-card__role">Desde el mapa puedes volver a retar a cualquier rival.</p>
          </div>
        </div>
      )}

      {openGame && (
        <p className="notebook-card__open">
          Tienes una partida en curso contra <strong>{openGame.rival.name}</strong>.
          {!continuesGame && (
            <>
              {" "}
              <Link className="notebook-card__link" href={platformRoutes.playedGame(openGame.id)}>
                Continuar la partida
              </Link>
            </>
          )}
        </p>
      )}

      <div className="notebook-card__actions">
        {continuesGame ? (
          <Link
            className="platform-button platform-button_variant_accent platform-button_size_lg"
            href={platformRoutes.playedGame(openGame.id)}
          >
            Continuar la partida
            <ArrowRightIcon variant="classic-solid" className="platform-button__icon" />
          </Link>
        ) : (
          <Link className="platform-button platform-button_variant_accent platform-button_size_lg" href={mapHref}>
            {mapLabel}
            <ArrowRightIcon variant="classic-solid" className="platform-button__icon" />
          </Link>
        )}
        {continuesGame && (
          <Link className="notebook-card__link" href={mapHref}>
            Abrir el mapa
          </Link>
        )}
        <Link className="notebook-card__link" href={platformRoutes.adventures}>
          Elegir otro cuaderno
        </Link>
      </div>
    </article>
  );
}
