import Link from "next/link";
import { useId } from "react";
import { JourneyMiniature } from "@/components/adventure/cover/journey-miniature/journey-miniature.comp";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon.comp";
import { StarIcon } from "@/components/icons/star-icon.comp";
import { ADVENTURE_ART } from "@/lib/adventure/adventures";
import { platformRoutes } from "@/lib/platform-routes";
import type { EncounterState, ShelfNotebook } from "@/services/adventure/adventure.types";
import "@/components/adventure/adventure.css";
import "./open-notebook.comp.css";

interface OpenNotebookProps {
  notebook: ShelfNotebook;
}

/** Each rival's state from how many are beaten: the next one is the available one. */
function statesOf(notebook: ShelfNotebook): EncounterState[] {
  return Array.from({ length: notebook.total }, (_, index) =>
    index < notebook.beaten ? "beaten" : index === notebook.beaten ? "available" : "locked",
  );
}

/**
 * A notebook of the shelf that can be opened: the whole journey on its cover,
 * its place, its name, how many rivals are beaten with a bar of twelve
 * segments, and «Abrir el mapa». The page of the person is the only thing
 * that differs from one person to another.
 */
export function OpenNotebook({ notebook }: OpenNotebookProps) {
  const titleId = useId();
  const art = ADVENTURE_ART[notebook.slug];
  const states = statesOf(notebook);

  return (
    <article className="adventure open-notebook" aria-labelledby={titleId}>
      {art && (
        <div className="open-notebook__picture">
          <JourneyMiniature
            adventure={notebook.slug}
            art={art.miniature.wide}
            states={states}
            variant="wide"
            label={`El viaje entero de ${notebook.title}`}
          />
        </div>
      )}
      <div className="open-notebook__page">
        <p className="open-notebook__eyebrow">{notebook.place} · Abierto</p>
        <h2 className="open-notebook__title" id={titleId}>
          {notebook.title}
        </h2>
        <p className="open-notebook__progress">
          <strong>
            {notebook.beaten} de {notebook.total}
          </strong>{" "}
          rivales
          {notebook.stars > 0 && (
            <span className="open-notebook__stars">
              <StarIcon variant="duotone-solid" className="open-notebook__star" />
              {notebook.stars}
              <span className="open-notebook__sr"> {notebook.stars === 1 ? "estrella" : "estrellas"}</span>
            </span>
          )}
        </p>
        <ol className="open-notebook__bar" aria-hidden="true">
          {states.map((state, index) => (
            <li key={index} className={`open-notebook__segment open-notebook__segment_state_${state}`} />
          ))}
        </ol>
        <Link
          className="platform-button platform-button_variant_accent platform-button_size_lg"
          href={platformRoutes.adventureMap(notebook.slug)}
        >
          Abrir el mapa
          <ArrowRightIcon variant="classic-solid" className="platform-button__icon" />
        </Link>
      </div>
    </article>
  );
}
