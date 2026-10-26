import { CheckIcon } from "@/components/icons/check-icon.comp";
import { CommentDotsIcon } from "@/components/icons/comment-dots-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { SiteWhatsappButton } from "@/components/site/shared/site-whatsapp-button/site-whatsapp-button.comp";
import { academyHome } from "@/config/academy-home.config";
import { getSiteSettingsData } from "@/services/site-settings/site-settings.service";
import "./information.section.css";

/**
 * How to start (`AcadInfoA`, `#informacion`, the header's «Información»):
 * no public prices (the owner's decision) — three steps from the first
 * message to the platform account, and the blue card that opens WhatsApp with
 * the booking message, shown as it will be written, to the CMS's number.
 * There is no form and no lead is stored: the card says so.
 */
export async function InformationSection() {
  const { information, booking } = academyHome;
  const { whatsappNumber } = await getSiteSettingsData();

  return (
    <SiteSection id="informacion" labelledBy="informacion-titulo">
      <div className="home-info">
        <div className="home-info__copy">
          <SiteEyebrow>
            <CommentDotsIcon />
            {information.eyebrow}
          </SiteEyebrow>
          <SiteHeading
            id="informacion-titulo"
            text={information.heading.text}
            emphasis={information.heading.emphasis}
          />
          {information.lead && <SiteLead text={information.lead} />}
          <ol className="home-info__steps" aria-label="Cómo empezar">
            {information.steps.map((step, index) => (
              <li key={step.title} className="home-info__step">
                <span className="home-info__number" aria-hidden="true">
                  {index + 1}
                </span>
                <span>
                  <b className="home-info__step-title">{step.title}</b>
                  <span className="home-info__step-text">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="home-info__card" aria-labelledby="informacion-tarjeta">
          <h3 id="informacion-tarjeta" className="home-info__card-title">
            {information.card.title}
          </h3>
          <p className="home-info__card-text">{information.card.text}</p>
          <div className="home-info__message">
            <small className="home-info__message-label">
              <CommentDotsIcon className="home-info__message-icon" />
              {information.card.preview}
            </small>
            <p className="home-info__message-text">«{booking.message}»</p>
          </div>
          <SiteWhatsappButton
            label={information.card.button}
            message={booking.message}
            color="filled"
            size="md"
            className="home-info__whatsapp"
          />
          <p className="home-info__number-line">WhatsApp +{whatsappNumber}</p>
          <ul className="home-info__promises">
            {information.promises.map((promise) => (
              <li key={promise.strong} className="home-info__promise">
                <span className="home-info__promise-icon">
                  <CheckIcon variant="classic-solid" />
                </span>
                <span>
                  <b>{promise.strong}</b> {promise.text}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </SiteSection>
  );
}
