import Link from "next/link";
import { CalendarClockIcon } from "@/components/icons/calendar-clock-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { GraduationCapIcon } from "@/components/icons/graduation-cap-icon.comp";
import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { academyHome } from "@/config/academy-home.config";
import { mdButton } from "@/lib/material/material-classes";
import { wavyPath } from "@/lib/site/wavy-shape";
import type { HomeFigureCopy } from "@/types/academy-home.types";
import "./figures.section.css";

const ICONS = {
  users: UsersIcon,
  "calendar-clock": CalendarClockIcon,
  "graduation-cap": GraduationCapIcon,
  trophy: TrophyIcon,
};

const COOKIE = wavyPath({ cx: 150, cy: 150, radius: 134, amplitude: 12, lobes: 12 });
const CLOVER = wavyPath({ cx: 150, cy: 150, radius: 118, amplitude: 30, lobes: 4 });

/** The figure's backdrop, one of Material's shapes, drawn in its own colours by the stylesheet. */
function FigureShape({ shape }: { shape: HomeFigureCopy["shape"] }) {
  if (shape === "cookie" || shape === "clover") {
    return (
      <svg className="home-figures__shape" viewBox="0 0 300 300" aria-hidden="true">
        <path d={shape === "cookie" ? COOKIE : CLOVER} />
      </svg>
    );
  }
  if (shape === "arch") {
    return (
      <svg className="home-figures__shape" viewBox="0 0 200 200" aria-hidden="true">
        <path d="M0 100 A100 100 0 0 1 200 100 V172 A28 28 0 0 1 172 200 H28 A28 28 0 0 1 0 172 Z" />
      </svg>
    );
  }
  return (
    <svg className="home-figures__shape" viewBox="0 0 200 200" aria-hidden="true">
      <rect x="1" y="1" width="198" height="198" rx="48" />
    </svg>
  );
}

/**
 * The academy in four figures (`AcadCifrasB`): students, classes, titled
 * teachers and years, each on a shape of its own. No figure is invented: the
 * section is drawn only when every one has the real value the owner gave
 * (config/academy-home.config.ts); until then it is not on the page.
 */
export function FiguresSection() {
  const { figures } = academyHome;
  if (figures.items.some((item) => item.value === null)) return null;

  return (
    <SiteSection id="cifras" labelledBy="cifras-titulo" spacing="tight">
      <div className="home-figures">
        <div className="home-figures__copy">
          <SiteEyebrow>
            <UsersIcon />
            {figures.eyebrow}
          </SiteEyebrow>
          <SiteHeading id="cifras-titulo" text={figures.heading.text} emphasis={figures.heading.emphasis} />
          {figures.lead && <SiteLead text={figures.lead} />}
          <Link href={figures.link.href} className={`${mdButton("outlined", "sm")} home-figures__link`}>
            {figures.link.label}
            <ChevronRightIcon variant="classic-solid" className="site-md-icon" />
          </Link>
        </div>
        <ul className="home-figures__row" aria-label="La academia en cifras">
          {figures.items.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <li key={item.label} className={`home-figures__figure home-figures__figure_shape_${item.shape}`}>
                <div className="home-figures__disc">
                  <FigureShape shape={item.shape} />
                  <Icon className="home-figures__icon" />
                  <b className="home-figures__value">{item.value}</b>
                </div>
                <p className="home-figures__label">
                  {item.label}
                  <small className="home-figures__note">{item.note}</small>
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </SiteSection>
  );
}
