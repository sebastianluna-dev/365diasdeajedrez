import { BooksIcon } from "@/components/icons/books-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { CompassIcon } from "@/components/icons/compass-icon.comp";
import { FireIcon } from "@/components/icons/fire-icon.comp";
import { HouseIcon } from "@/components/icons/house-icon.comp";
import { ListOlIcon } from "@/components/icons/list-ol-icon.comp";
import { ShuffleIcon } from "@/components/icons/shuffle-icon.comp";
import { StopwatchIcon } from "@/components/icons/stopwatch-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { SiteBoard } from "@/components/site/shared/site-board/site-board.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { academyHome } from "@/config/academy-home.config";
import "./platform.section.css";

const FEATURE_ICONS = {
  "list-ol": ListOlIcon,
  books: BooksIcon,
  shuffle: ShuffleIcon,
  stopwatch: StopwatchIcon,
  compass: CompassIcon,
  fire: FireIcon,
};

/** The ring of the daily goal: a circle of radius 44 in a 104 box. */
const RING_LENGTH = 2 * Math.PI * 44;

/**
 * What a student does between classes (`AcadPlataformaC`, `#plataforma`):
 * the six things the platform brings, with Puzzle Rush lit and drawn beside
 * them as the platform shows it, and the card of the streak and the daily
 * goal floating over its corner. The mock-up is a picture with its name;
 * nothing in it is pressed.
 */
export function PlatformSection() {
  const { platform } = academyHome;
  const { rush, streak } = platform;
  const goalShare = Math.min(streak.minutes / streak.goal, 1);

  return (
    <SiteSection id="plataforma" labelledBy="plataforma-titulo">
      <div className="home-platform">
        <div className="home-platform__copy">
          <SiteEyebrow>
            <HouseIcon />
            {platform.eyebrow}
          </SiteEyebrow>
          <SiteHeading id="plataforma-titulo" text={platform.heading.text} emphasis={platform.heading.emphasis} />
          {platform.lead && <SiteLead text={platform.lead} />}
          <ul className="home-platform__features" aria-label="Lo que tienes en la plataforma">
            {platform.features.map((feature, index) => {
              const Icon = FEATURE_ICONS[feature.icon];
              const shown = index === platform.shown;
              return (
                <li
                  key={feature.title}
                  className={`home-platform__feature${shown ? " home-platform__feature_state_shown" : ""}`}
                >
                  <span className="home-platform__feature-icon">
                    <Icon variant={shown ? "classic-solid" : "duotone-light"} />
                  </span>
                  <span>
                    <b className="home-platform__feature-title">{feature.title}</b>
                    <span className="home-platform__feature-text">{feature.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="home-platform__stage">
          <div className="home-platform__window" role="img" aria-label={rush.label}>
            <div className="home-platform__bar">
              <span className="home-platform__brand">Puzzle Rush</span>
              <span className="home-platform__streak-chip">
                <FireIcon variant="classic-solid" className="home-platform__fire" />
                {streak.days}
              </span>
            </div>
            <div className="home-platform__body">
              <div className="home-platform__side">
                <span className="home-platform__fab">
                  <StopwatchIcon variant="classic-solid" className="home-platform__fab-icon" />
                  Puzzle Rush
                </span>
                <span className="home-platform__group">Temas</span>
                {rush.topics.map((topic, index) => (
                  <span
                    key={topic}
                    className={`home-platform__item${index === 1 ? " home-platform__item_state_on" : ""}`}
                  >
                    {topic}
                  </span>
                ))}
                <span className="home-platform__group">Tuyo</span>
                {rush.mine.map((item) => (
                  <span key={item} className="home-platform__item">
                    {item}
                  </span>
                ))}
              </div>
              <div className="home-platform__panel">
                <div className="home-platform__modes">
                  {rush.modes.map((mode, index) => (
                    <span
                      key={mode.title}
                      className={`home-platform__mode${index === 0 ? " home-platform__mode_state_on" : ""}`}
                    >
                      <b className="home-platform__mode-title">{mode.title}</b>
                      {mode.text}
                    </span>
                  ))}
                </div>
                <div className="home-platform__play">
                  <div className="home-platform__board">
                    <SiteBoard fen={rush.board.fen} label={rush.board.label} />
                  </div>
                  <div className="home-platform__score">
                    <div className="home-platform__counters">
                      <span>
                        <small className="home-platform__counter-label">Quedan</small>
                        <b className="home-platform__counter">{rush.left}</b>
                      </span>
                      <span className="home-platform__solved">
                        <small className="home-platform__counter-label">Resueltos</small>
                        <b className="home-platform__counter home-platform__counter_tone_primary">{rush.solved}</b>
                      </span>
                    </div>
                    <span className="home-platform__run">
                      {rush.run.map((solved, index) => (
                        <span
                          key={index}
                          className={`home-platform__slot home-platform__slot_state_${solved ? "solved" : "missed"}`}
                        >
                          {solved ? (
                            <CheckIcon variant="classic-solid" className="home-platform__slot-icon" />
                          ) : (
                            <XmarkIcon variant="classic-solid" className="home-platform__slot-icon" />
                          )}
                        </span>
                      ))}
                      <span className="home-platform__slot home-platform__slot_state_current">{rush.current}</span>
                      <span className="home-platform__slot home-platform__slot_state_empty" />
                    </span>
                    <b className="home-platform__turn">{rush.turn}</b>
                    <span className="home-platform__hint">{rush.note}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="home-platform__goal">
            <span className="home-platform__ring" aria-hidden="true">
              <svg viewBox="0 0 104 104" className="home-platform__ring-svg">
                <circle className="home-platform__ring-track" cx="52" cy="52" r="44" />
                <circle
                  className="home-platform__ring-fill"
                  cx="52"
                  cy="52"
                  r="44"
                  strokeDasharray={`${(RING_LENGTH * goalShare).toFixed(1)} ${RING_LENGTH.toFixed(1)}`}
                  transform="rotate(-90 52 52)"
                />
              </svg>
              <span className="home-platform__ring-text">
                <b className="home-platform__ring-value">{streak.minutes}</b>
                de {streak.goal} min
              </span>
            </span>
            <span>
              <b className="home-platform__goal-days">
                <FireIcon variant="classic-solid" className="home-platform__fire" />
                {streak.days}
              </b>
              <span className="home-platform__goal-text">{streak.text}</span>
            </span>
          </div>
        </div>
      </div>
    </SiteSection>
  );
}
