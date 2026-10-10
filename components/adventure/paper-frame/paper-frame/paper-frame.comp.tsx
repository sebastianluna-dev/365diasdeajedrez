import Link from "next/link";
import { useId, type ReactNode } from "react";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import "@/components/adventure/adventure.css";
import "./paper-frame.comp.css";

interface PaperFrameProps {
  /** The zone of the adventure the rival belongs to, as the notebook writes it: «Biblioteca Central». */
  zone: string;
  /** Where the game is played: «Sala de lectura». */
  place: string;
  /** The page of the notebook, which is the rival's place in the story. */
  page: number;
  /** The attempt this game is, 1 or more; null for whoever only reads the game and cannot know. */
  attempt: number | null;
  /** The adventure's map: where «Mapa» goes. */
  mapHref: string;
  /** The game: the platform's own screen, drawn as it always is. */
  children: ReactNode;
}

/**
 * A game of an adventure on a page of the notebook: the same screen of a game
 * (the board, the strips and the moves) laid on a ruled sheet with its binding
 * and its margin, headed by where it is played and which page and attempt it
 * is, and with the way back to the map. It only places what it is given, so it
 * takes `children` (the one exception to «a component receives data»): the
 * game keeps its own state and is the same piece in a free game.
 */
export function PaperFrame({ zone, place, page, attempt, mapHref, children }: PaperFrameProps) {
  const titleId = useId();
  return (
    <section className="adventure paper-frame" aria-labelledby={titleId}>
      <header className="paper-frame__head">
        <Link href={mapHref} className="platform-button platform-button_size_sm paper-frame__map">
          <ChevronLeftIcon variant="classic-solid" className="platform-button__icon" />
          Mapa
        </Link>
        <h1 className="paper-frame__place" id={titleId}>
          <span className="paper-frame__zone">{zone}</span>
          <span className="paper-frame__separator" aria-hidden="true">
            {" "}
            ·{" "}
          </span>
          <span className="paper-frame__name">{place}</span>
        </h1>
        <p className="paper-frame__note">
          {attempt === null ? `Página ${page}` : `Página ${page} · Intento ${attempt}`}
        </p>
      </header>
      {children}
    </section>
  );
}
