import { CalendarClockIcon } from "@/components/icons/calendar-clock-icon.comp";
import { ChalkboardUserIcon } from "@/components/icons/chalkboard-user-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { academyHome } from "@/config/academy-home.config";
import { ClassroomMock } from "./classroom-mock.comp";
import "./classes.section.css";

const PROMISE_ICONS = [CircleCheckIcon, CalendarClockIcon];

/**
 * How the classes work (`AcadClasesA`, `#como-funciona`, the header's
 * «Clases»): individual or group, the classroom the platform will have
 * (drawn, «Próximamente»), the three steps from booking to reviewing, and the
 * two promises. It says what is true today — a class is joined with its link,
 * from the platform — where the canvas promised the built-in classroom: the
 * owner's decision is that it is not built yet.
 */
export function ClassesSection() {
  const { classes } = academyHome;

  return (
    <SiteSection id="como-funciona" labelledBy="como-funciona-titulo">
      <div className="home-classes">
        <div className="home-classes__head">
          <div className="home-classes__copy">
            <SiteEyebrow>
              <ChalkboardUserIcon />
              {classes.eyebrow}
            </SiteEyebrow>
            <SiteHeading id="como-funciona-titulo" text={classes.heading.text} emphasis={classes.heading.emphasis} />
            {classes.lead && <SiteLead text={classes.lead} />}
          </div>
          <ul className="home-classes__formats" aria-label="Modalidades">
            {classes.formats.map((format) => {
              const Icon = format.icon === "user" ? UserIcon : UsersIcon;
              return (
                <li key={format.title} className="home-classes__format">
                  <span className="home-classes__format-icon">
                    <Icon />
                  </span>
                  <span>
                    <b className="home-classes__format-title">{format.title}</b>
                    <span className="home-classes__text">{format.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <ClassroomMock room={classes.room} />

        <div className="home-classes__foot">
          <ol className="home-classes__steps" aria-label="Cómo funcionan las clases">
            {classes.steps.map((step, index) => (
              <li key={step.title} className="home-classes__step">
                <span className="home-classes__number" aria-hidden="true">
                  {index + 1}
                </span>
                <b className="home-classes__step-title">{step.title}</b>
                <span className="home-classes__text">{step.text}</span>
              </li>
            ))}
          </ol>
          <ul className="home-classes__promises" aria-label="Lo que te prometemos">
            {classes.promises.map((promise, index) => {
              const Icon = PROMISE_ICONS[index] ?? CircleCheckIcon;
              return (
                <li key={promise.title} className="home-classes__promise">
                  <Icon className="home-classes__promise-icon" />
                  <span>
                    <b className="home-classes__promise-title">{promise.title}</b>
                    <small className="home-classes__promise-text">{promise.text}</small>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="home-classes__note">{classes.note}</p>
      </div>
    </SiteSection>
  );
}
