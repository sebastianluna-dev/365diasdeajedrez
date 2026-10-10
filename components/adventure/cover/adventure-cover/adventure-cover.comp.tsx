import { JourneyMiniature } from "@/components/adventure/cover/journey-miniature/journey-miniature.comp";
import { NotebookCard } from "@/components/adventure/cover/notebook-card/notebook-card.comp";
import { Ticket } from "@/components/adventure/cover/ticket/ticket.comp";
import { ADVENTURE_ART } from "@/lib/adventure/adventures";
import { platformRoutes } from "@/lib/platform-routes";
import type { AdventureProgressView } from "@/services/adventure/adventure.types";
import "@/components/adventure/adventure.css";
import "./adventure-cover.comp.css";

interface AdventureCoverProps {
  progress: AdventureProgressView;
}

/** A coffee mug seen from above, left on the desk: only its ring and its handle are drawn. */
function CoffeeCup() {
  return (
    <svg className="adventure-cover__object adventure-cover__cup" viewBox="-100 -100 220 200" aria-hidden="true">
      <ellipse cx="6" cy="10" rx="92" ry="88" fill="rgba(0,0,0,0.28)" />
      <path d="M70 -34 a34 34 0 0 1 0 68" fill="none" stroke="#f1e5c8" strokeWidth="16" strokeLinecap="round" />
      <circle cx="0" cy="0" r="82" fill="#f1e5c8" />
      <circle cx="0" cy="0" r="66" fill="#6e4630" />
      <circle cx="0" cy="0" r="54" fill="#3a2418" />
      <path d="M-30 -38 q20 -16 46 -6" fill="none" stroke="#a87c58" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** A pencil lying across the corner of the desk. */
function Pencil() {
  return (
    <svg className="adventure-cover__object adventure-cover__pencil" viewBox="0 0 300 26" aria-hidden="true">
      <rect x="40" y="3" width="210" height="20" fill="#d39f45" />
      <rect x="40" y="3" width="210" height="6" fill="#e6b865" />
      <path d="M40 3 L2 13 L40 23Z" fill="#efe5cf" />
      <path d="M14 10 L2 13 L14 16Z" fill="#3a2418" />
      <rect x="250" y="3" width="18" height="20" fill="#b9bdc4" />
      <rect x="268" y="3" width="30" height="20" rx="4" fill="#c8745f" />
    </svg>
  );
}

/**
 * «Jugar» as a desk: the adventure's notebook open in the middle — the whole
 * journey on its left page, where the person stands on its right — and two
 * tickets beside it, «Partida libre» and «Contra una persona». The notebook is
 * the way in the person is meant to take; the tickets are the other two.
 */
export function AdventureCover({ progress }: AdventureCoverProps) {
  const art = ADVENTURE_ART[progress.slug];
  const states = progress.encounters.map((encounter) => encounter.state);

  return (
    <div className="adventure adventure-cover">
      <div className="adventure-cover__scene">
        <header className="adventure-cover__intro">
          <h1 className="adventure-cover__title">Jugar</h1>
          <p className="adventure-cover__lead">
            Sigue el cuaderno del viajero por la ciudad, elige un bot para una partida libre o, pronto, reta a otra
            persona.
          </p>
        </header>

        <div className="adventure-cover__book">
          <div className="adventure-cover__page adventure-cover__page_side_map">
            {art && (
              <div className="adventure-cover__picture">
                <JourneyMiniature
                  adventure={progress.slug}
                  art={art.miniature.tall}
                  states={states}
                  variant="tall"
                  label="El viaje entero: el camino sube de la plaza del barrio al Palacio de los Escaques"
                />
                <JourneyMiniature
                  adventure={progress.slug}
                  art={art.miniature.wide}
                  states={states}
                  variant="wide"
                  label="El viaje entero: de la plaza del barrio al Palacio de los Escaques"
                />
              </div>
            )}
            <span className="adventure-cover__tape adventure-cover__tape_corner_top" aria-hidden="true" />
            <span className="adventure-cover__tape adventure-cover__tape_corner_bottom" aria-hidden="true" />
          </div>
          <div className="adventure-cover__page adventure-cover__page_side_info">
            <NotebookCard progress={progress} />
          </div>
        </div>

        <div className="adventure-cover__tickets">
          <Ticket
            tone="free"
            eyebrow="Galería de bots"
            title="Partida libre"
            description="Elige a cualquier bot de la galería y juega sin seguir la historia."
            stub="Cualquier bot"
            action={{ href: platformRoutes.freePlay, label: "Elegir un bot" }}
          />
          <Ticket
            tone="person"
            eyebrow="Partida amistosa"
            title="Contra una persona"
            description="Reta a otro alumno de la plataforma."
            stub="Admite dos"
            soon
          />
        </div>

        <Pencil />
        <CoffeeCup />
      </div>
    </div>
  );
}
