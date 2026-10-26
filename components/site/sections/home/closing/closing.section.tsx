import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { SiteBoard } from "@/components/site/shared/site-board/site-board.comp";
import { SiteChips } from "@/components/site/shared/site-chips/site-chips.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { SiteWhatsappButton } from "@/components/site/shared/site-whatsapp-button/site-whatsapp-button.comp";
import { academyHome } from "@/config/academy-home.config";
import "./closing.section.css";

/**
 * The page's last call (the band of «Cierre C», `AcadCierreC`, `#contacto`):
 * the Italian Game with black to move — «La siguiente jugada es tuya» — the
 * trial-class button, «Pide información» and the three promises. The footer
 * under it is the shared `SiteFooter` («Cierre y pie B»'s, the owner's choice).
 */
export function ClosingSection() {
  const { closing, booking } = academyHome;

  return (
    <SiteSection id="contacto" labelledBy="contacto-titulo">
      <div className="home-closing">
        <div className="home-closing__board">
          <SiteBoard fen={closing.board.fen} lastMove={closing.board.lastMove} label={closing.board.label} />
          <p className="home-closing__turn">
            <span className="home-closing__dot" aria-hidden="true" />
            <b>{closing.board.turn}</b>
            <small className="home-closing__opening">{closing.board.opening}</small>
          </p>
        </div>
        <div className="home-closing__copy">
          <SiteEyebrow>
            <CalendarIcon />
            {closing.eyebrow}
          </SiteEyebrow>
          <SiteHeading
            id="contacto-titulo"
            size="display"
            text={closing.heading.text}
            emphasis={closing.heading.emphasis}
          />
          <p className="home-closing__text">{closing.text}</p>
          <div className="home-closing__actions">
            <SiteWhatsappButton
              label={booking.label}
              message={booking.message}
              color="filled"
              size="md"
              icon="calendar"
            />
            <SiteWhatsappButton label={closing.info.label} message={closing.info.message} color="outlined" size="md" />
          </div>
          <SiteChips label="Así son las clases" chips={closing.chips} />
        </div>
      </div>
    </SiteSection>
  );
}
