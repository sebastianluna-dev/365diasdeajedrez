import type { ComingAdventureSeed } from "@/lib/adventure/adventure.types";
import { NotebookCoverArt } from "./notebook-cover-art.comp";
import "@/components/adventure/adventure.css";
import "./notebook-spine.comp.css";

interface NotebookSpineProps {
  notebook: ComingAdventureSeed;
}

/** «son jarocho» → «Son jarocho». */
function sentenceOf(text: string): string {
  return text.charAt(0).toLocaleUpperCase("es") + text.slice(1);
}

/**
 * A notebook on the shelf that is not open yet: its cover, with its motif, a
 * «Próximamente» stamp across it, its name and what it will explore. It has no
 * action and no date: it is a promise, not a link. The list that holds them
 * is the shelf's.
 */
export function NotebookSpine({ notebook }: NotebookSpineProps) {
  return (
    <li className="adventure notebook-spine">
      <div className="notebook-spine__cover">
        <NotebookCoverArt slug={notebook.slug} />
        {/* Across the cover's label, which is left blank for it. */}
        <span className="notebook-spine__soon">Próximamente</span>
      </div>
      <h3 className="notebook-spine__name">{notebook.title}</h3>
      <p className="notebook-spine__reason">{sentenceOf(notebook.reason)}</p>
    </li>
  );
}
