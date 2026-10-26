import { NotebookSpine } from "@/components/adventure/shelf/notebook-spine/notebook-spine.comp";
import { OpenNotebook } from "@/components/adventure/shelf/open-notebook/open-notebook.comp";
import type { AdventureShelfView } from "@/services/adventure/adventure.types";
import "@/components/adventure/adventure.css";
import "./adventure-shelf.comp.css";

interface AdventureShelfProps {
  shelf: AdventureShelfView;
}

/**
 * «Elige tu cuaderno»: a bookshelf of dark wood. The notebooks that can be
 * opened stand at the left, open, with the person's progress; the ones that
 * are coming stand closed on two boards at the right, each with its cover,
 * its «Próximamente» and no action. Since 2026-10-26 it is the lower half of
 * «Jugar» (`/jugar#cuadernos`), an island of the adventure's paper inside the
 * new design system's panel; the page above it says where the person is.
 * It is a block under its heading, not a landmark of its own: the page is
 * the one region.
 */
export function AdventureShelf({ shelf }: AdventureShelfProps) {
  return (
    <div className="adventure adventure-shelf">
      <div className="adventure-shelf__head">
        <h2 className="adventure-shelf__title">Elige tu cuaderno</h2>
        <p className="adventure-shelf__lead">Cada cuaderno es una aventura: una ciudad, sus torneos y su gente.</p>
      </div>

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
  );
}
