import { ProfeLealPortrait } from "@/components/adventure/portraits/profe-leal-portrait.comp";
import { TonitoGarzaPortrait } from "@/components/adventure/portraits/tonito-garza-portrait.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { CompassIcon } from "@/components/icons/compass-icon.comp";
import { FireIcon } from "@/components/icons/fire-icon.comp";
import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { SiteWhatsappButton } from "@/components/site/shared/site-whatsapp-button/site-whatsapp-button.comp";
import { academyHome } from "@/config/academy-home.config";
import { NotebookMap } from "./notebook-map.comp";
import "./adventure.section.css";

const FACT_ICONS = { trophy: TrophyIcon, "circle-check": CircleCheckIcon };
/** The two rivals' engraved portraits, by their initials in the copy. */
const PORTRAITS: Record<string, () => React.ReactElement> = { PL: ProfeLealPortrait, TG: TonitoGarzaPortrait };

/**
 * The adventure mode (`AcadAventura2A`, `#aventura`): playing the computer
 * inside a story, never sold as «for kids» (the owner's decision). The copy,
 * the two facts, the line that playing does not count for the streak (the
 * platform's rule) and «Pregunta por la plataforma»; beside them the
 * notebook's map at the Club La Torre (`NotebookMap`) and the two rivals of
 * that place, one beaten and the next one.
 */
export function AdventureSection() {
  const { adventure } = academyHome;

  return (
    <SiteSection id="aventura" labelledBy="aventura-titulo">
      <div className="home-adventure">
        <div className="home-adventure__copy">
          <SiteEyebrow>
            <CompassIcon />
            {adventure.eyebrow}
          </SiteEyebrow>
          <SiteHeading id="aventura-titulo" text={adventure.heading.text} emphasis={adventure.heading.emphasis} />
          {adventure.lead && <SiteLead text={adventure.lead} />}
          <ul className="home-adventure__facts">
            {adventure.facts.map((fact) => {
              const Icon = FACT_ICONS[fact.icon];
              return (
                <li key={fact.title} className="home-adventure__fact">
                  <span className="home-adventure__fact-icon">
                    <Icon />
                  </span>
                  <span>
                    <b className="home-adventure__fact-title">{fact.title}</b>
                    <small className="home-adventure__fact-text">{fact.text}</small>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="home-adventure__streak">
            <span className="home-adventure__streak-icon">
              <FireIcon variant="classic-solid" />
            </span>
            <span>
              <b>{adventure.streak.strong}</b> {adventure.streak.text}
            </span>
          </p>
          <SiteWhatsappButton
            label={adventure.ask.label}
            message={adventure.ask.message}
            color="tonal"
            className="home-adventure__ask"
          />
        </div>

        <div className="home-adventure__right">
          <NotebookMap map={adventure.map} />
          <ul className="home-adventure__rivals" aria-label="Dos rivales del Club La Torre">
            {adventure.rivals.map((rival) => {
              const Portrait = PORTRAITS[rival.initials];
              return (
                <li key={rival.name} className="home-adventure__rival">
                  <span className="home-adventure__face" aria-hidden="true">
                    {Portrait ? (
                      <svg className="home-adventure__face-art" viewBox="0 0 100 112">
                        <Portrait />
                      </svg>
                    ) : (
                      rival.initials
                    )}
                  </span>
                  <span className="home-adventure__rival-body">
                    <b className="home-adventure__rival-name">{rival.name}</b>
                    <small className="home-adventure__rival-role">{rival.role}</small>
                    <q className="home-adventure__quote">{rival.quote}</q>
                    <span className="home-adventure__tags">
                      {rival.tags.map((tag, index) => (
                        <span
                          key={tag}
                          className={`home-adventure__tag${
                            index === 0 ? ` home-adventure__tag_state_${rival.state}` : ""
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </SiteSection>
  );
}
