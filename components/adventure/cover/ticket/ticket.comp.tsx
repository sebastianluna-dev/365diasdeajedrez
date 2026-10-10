import Link from "next/link";
import { useId } from "react";
import { ChessBishopIcon } from "@/components/icons/chess-bishop-icon.comp";
import { ChessKingIcon } from "@/components/icons/chess-king-icon.comp";
import { ChessKnightIcon } from "@/components/icons/chess-knight-icon.comp";
import { ChessPawnIcon } from "@/components/icons/chess-pawn-icon.comp";
import { ChessQueenIcon } from "@/components/icons/chess-queen-icon.comp";
import "@/components/adventure/adventure.css";
import "./ticket.comp.css";

interface TicketProps {
  /** The ticket's colour and its drawing: the warm one is a way in, the quiet one is not open yet. */
  tone: "free" | "person";
  /** The small line above the title: «Galería de bots». */
  eyebrow: string;
  title: string;
  description: string;
  /** The vertical word on the stub, torn off along the perforation: «Cualquier bot». */
  stub: string;
  /** The way in, a link; without it the ticket is not open (and says so with `soon`). */
  action?: { href: string; label: string };
  /** The «Próximamente» stamp, for a ticket that cannot be used yet. */
  soon?: boolean;
}

/**
 * A ticket on the desk: a stub with a word on it, a printed body and, apart
 * from it, one way in. «Partida libre» opens the gallery of bots; «Contra una
 * persona» is the ticket that is not valid yet, and carries a stamp instead of
 * an action. The drawing in the corner is chosen by `tone`.
 */
export function Ticket({ tone, eyebrow, title, description, stub, action, soon = false }: TicketProps) {
  const titleId = useId();
  return (
    <article className={`adventure ticket ticket_tone_${tone}`} aria-labelledby={titleId}>
      <div className="ticket__paper">
        <div className="ticket__stub" aria-hidden="true">
          <span className="ticket__stub-word">{stub}</span>
        </div>
        <div className="ticket__body">
          <p className="ticket__eyebrow">{eyebrow}</p>
          <h2 className="ticket__title" id={titleId}>
            {title}
          </h2>
          <p className="ticket__description">{description}</p>
          <span className="ticket__art" aria-hidden="true">
            {tone === "free" ? (
              <>
                <ChessPawnIcon variant="duotone-solid" className="ticket__piece" />
                <ChessKnightIcon variant="duotone-solid" className="ticket__piece" />
                <ChessBishopIcon variant="duotone-solid" className="ticket__piece" />
              </>
            ) : (
              <>
                <ChessKingIcon variant="duotone-solid" className="ticket__piece" />
                <ChessQueenIcon variant="duotone-solid" className="ticket__piece" />
              </>
            )}
          </span>
          {action && (
            <Link className="platform-button" href={action.href}>
              {action.label}
            </Link>
          )}
          {soon && <span className="ticket__soon">Próximamente</span>}
        </div>
      </div>
    </article>
  );
}
