import { UserIcon } from "@/components/icons/user-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { SiteWhatsappButton } from "@/components/site/shared/site-whatsapp-button/site-whatsapp-button.comp";
import { academyHome } from "@/config/academy-home.config";
import { wavyPath } from "@/lib/site/wavy-shape";
import "./team.section.css";

/** The five frames of the canvas, in turn: an arch, a ringed circle, a cookie, a rounded square, a clover. */
const FRAMES = ["arch", "circle", "cookie", "square", "clover"] as const;
const COOKIE = wavyPath({ cx: 150, cy: 150, radius: 132, amplitude: 14, lobes: 12 });
const CLOVER = wavyPath({ cx: 150, cy: 150, radius: 116, amplitude: 32, lobes: 4 });

/**
 * The academy is a team, never one teacher as a brand (`AcadEquipoA`,
 * `#equipo`): the heading, how a teacher is assigned in three steps and the
 * button that books a trial class. The teachers themselves — name, FIDE title
 * and a line each, on the canvas's five frames — are drawn only once the owner
 * gives them (`academyHome.team.members`); until then no face is invented.
 */
export function TeamSection() {
  const { team, booking } = academyHome;

  return (
    <SiteSection id="equipo" labelledBy="equipo-titulo">
      <div className="home-team">
        <div className="home-team__head">
          <SiteEyebrow align="center">
            <UsersIcon />
            {team.eyebrow}
          </SiteEyebrow>
          <SiteHeading id="equipo-titulo" align="center" text={team.heading.text} emphasis={team.heading.emphasis} />
          {team.lead && <SiteLead align="center" text={team.lead} />}
        </div>

        {team.members.length > 0 && (
          <ul className="home-team__members" aria-label="Maestros del equipo">
            {team.members.map((member, index) => {
              const frame = FRAMES[index % FRAMES.length] ?? "arch";
              return (
                <li key={member.name} className={`home-team__member home-team__member_frame_${frame}`}>
                  <span className="home-team__portrait" aria-hidden="true">
                    {(frame === "cookie" || frame === "clover") && (
                      <svg className="home-team__shape" viewBox="0 0 300 300">
                        <path d={frame === "cookie" ? COOKIE : CLOVER} />
                      </svg>
                    )}
                    <UserIcon className="home-team__portrait-icon" />
                  </span>
                  <b className="home-team__name">{member.name}</b>
                  <span className="home-team__title">{member.title}</span>
                  <span className="home-team__line">{member.line}</span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="home-team__assign">
          <h3 className="home-team__assign-title">{team.assign.title}</h3>
          <ol className="home-team__steps">
            {team.assign.steps.map((step, index) => (
              <li key={step.title} className="home-team__step">
                <span className="home-team__number" aria-hidden="true">
                  {index + 1}
                </span>
                <span>
                  <b className="home-team__step-title">{step.title}</b>
                  <span className="home-team__step-text">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <SiteWhatsappButton
            label={booking.label}
            message={booking.message}
            color="filled"
            size="md"
            icon="calendar"
            className="home-team__cta"
          />
        </div>
      </div>
    </SiteSection>
  );
}
