import Link from "next/link";
import { NotebookSpine } from "@/components/adventure/shelf/notebook-spine/notebook-spine.comp";
import { OpenNotebook } from "@/components/adventure/shelf/open-notebook/open-notebook.comp";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { AdventureShelfView } from "@/services/adventure/adventure.types";
import "@/components/adventure/adventure.css";
import "./adventure-shelf.comp.css";

interface AdventureShelfProps {
  shelf: AdventureShelfView;
}

/**
 * «Elige tu cuaderno»: a bookshelf in a dark wooden room. The notebooks that
 * can be opened stand at the left, open, with the person's progress; the ones
 * that are coming stand closed on two boards at the right, each with its
 * «Próximamente» and no action. «Jugar» is one link away.
 */
export function AdventureShelf({ shelf }: AdventureShelfProps) {
  return (
    <div className="adventure adventure-shelf">
      <div className="adventure-shelf__room">
        <header className="adventure-shelf__head">
          <Link className="platform-button platform-button_size_sm" href={platformRoutes.play}>
            <ChevronLeftIcon variant="classic-solid" className="platform-button__icon" />
            Jugar
          </Link>
          <div>
            <h1 className="adventure-shelf__title">Elige tu cuaderno</h1>
            <p className="adventure-shelf__lead">Cada cuaderno es una aventura: una ciudad, sus torneos y su gente.</p>
          </div>
        </header>

        <div className="adventure-shelf__shelves">
          <div className="adventure-shelf__open">
            {shelf.notebooks.map((notebook) => (
              <OpenNotebook key={notebook.slug} notebook={notebook} />
            ))}
          </div>
          <ul className="adventure-shelf__closed" aria-label="Cuadernos que vienen">
            {shelf.coming.map((notebook) => (
              <NotebookSpine key={notebook.slug} notebook={notebook} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
