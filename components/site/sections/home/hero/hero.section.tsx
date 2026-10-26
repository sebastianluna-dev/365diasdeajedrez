import type { CSSProperties } from "react";
import Link from "next/link";
import { ChalkboardUserIcon } from "@/components/icons/chalkboard-user-icon.comp";
import { ChessBoardIcon } from "@/components/icons/chess-board-icon.comp";
import { SiteBoard } from "@/components/site/shared/site-board/site-board.comp";
import { SiteChips } from "@/components/site/shared/site-chips/site-chips.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteWhatsappButton } from "@/components/site/shared/site-whatsapp-button/site-whatsapp-button.comp";
import { academyHome } from "@/config/academy-home.config";
import { mdButton } from "@/lib/material/material-classes";
import { squareClipShape, wavyClipShape, wavyPath } from "@/lib/site/wavy-shape";
import "./hero.section.css";

/** The board's box in the canvas's units: the outlines are measured in it and drawn in percentages of it. */
const BOARD = 528;

/** The cookie the board is cut into: nine lobes. A quarter of a lobe is 2π/9/4 rad. */
const cookie = (turn: number) =>
  wavyClipShape({ cx: BOARD / 2, cy: BOARD / 2, radius: 248, amplitude: 16, lobes: 9, turn }, BOARD);
const LOBE = (Math.PI * 2) / 9;

// Computed once, when the module loads on the server: the page is static.
const CUT_STYLE = {
  "--home-hero-cut-from": cookie(0),
  "--home-hero-cut-r1": cookie(LOBE / 4),
  "--home-hero-cut-r2": cookie(LOBE / 2),
  "--home-hero-cut-r3": cookie((LOBE * 3) / 4),
  "--home-hero-cut-to": squareClipShape(BOARD),
} as CSSProperties;
const HALO = wavyPath({ cx: 320, cy: 320, radius: 296, amplitude: 16, lobes: 9, turn: 0.17 });
const SEAL = wavyPath({ cx: 150, cy: 150, radius: 132, amplitude: 14, lobes: 12 });

/**
 * The opening of the academy's home (`HeroAcademiaDA`): the page's `h1`, the
 * three promises, the button that books a trial class on WhatsApp and, beside
 * them, the board cut into a cookie that spins once and opens into the whole
 * board, where it stays (hero.section.css; reduced motion shows the board
 * open from the start).
 */
export function HeroSection() {
  const { hero, booking } = academyHome;

  return (
    <section id="inicio" className="home-hero" aria-labelledby="inicio-titulo">
      <div className="home-hero__inner">
        <div className="home-hero__copy">
          <SiteEyebrow>
            <ChalkboardUserIcon />
            {hero.eyebrow}
          </SiteEyebrow>
          <SiteHeading id="inicio-titulo" size="hero" text={hero.heading.text} emphasis={hero.heading.emphasis} />
          <p className="home-hero__lead">{hero.lead}</p>
          <SiteChips label="Así son las clases" chips={hero.chips.map((text) => ({ icon: "check", text }))} />
          <div className="home-hero__actions">
            <SiteWhatsappButton
              label={booking.label}
              message={booking.message}
              color="filled"
              size="md"
              icon="calendar"
            />
            <Link href={hero.secondary.href} className={mdButton("outlined", "md")}>
              {hero.secondary.label}
            </Link>
          </div>
          <p className="home-hero__note">{hero.note}</p>
        </div>

        <div className="home-hero__stage">
          <svg className="home-hero__halo" viewBox="0 0 640 640" aria-hidden="true">
            <path d={HALO} />
          </svg>
          <div className="home-hero__cut" style={CUT_STYLE}>
            <SiteBoard fen={hero.board.fen} lastMove={hero.board.lastMove} label={hero.board.label} />
          </div>
          <span className="home-hero__badge" aria-hidden="true">
            <svg className="home-hero__seal" viewBox="0 0 300 300">
              <path d={SEAL} />
            </svg>
            <ChessBoardIcon variant="classic-solid" className="home-hero__badge-icon" />
          </span>
          <div className="home-hero__caption">
            <span className="home-hero__move" aria-hidden="true">
              {hero.caption.move}
            </span>
            <span>
              <b className="home-hero__caption-title">{hero.caption.title}</b>
              <small className="home-hero__caption-text">{hero.caption.text}</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
