import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { academyHome } from "@/config/academy-home.config";
import { getReviewsData } from "@/services/home/home.service";
import type { ReviewContent } from "@/services/home/home.types";
import "./testimonials.section.css";

const COLUMNS = 3;

/**
 * What the students say (`AcadTestimoniosA`, `#testimonios`), as a wall of
 * quotes in three columns. The testimonials are the CMS's (`home-reviews`,
 * which fed the old chat-style reviews): each one's messages become its quote,
 * its initial the avatar and its highlighted figure the chip under it. The
 * canvas's «[Cita]» placeholders are never drawn: with no testimonial in the
 * CMS, the section is not on the page.
 */
export async function TestimonialsSection() {
  const { testimonials } = academyHome;
  const { reviews } = await getReviewsData();
  if (reviews.length === 0) return null;

  // Round-robin into the columns, so the wall reads across before it reads down.
  const columns: ReviewContent[][] = Array.from({ length: Math.min(COLUMNS, reviews.length) }, () => []);
  reviews.forEach((review, index) => columns[index % columns.length]?.push(review));

  return (
    <SiteSection id="testimonios" labelledBy="testimonios-titulo">
      <div className="home-testimonials">
        <div className="home-testimonials__head">
          <div className="home-testimonials__title">
            <SiteEyebrow>
              <UsersIcon />
              {testimonials.eyebrow}
            </SiteEyebrow>
            <SiteHeading
              id="testimonios-titulo"
              text={testimonials.heading.text}
              emphasis={testimonials.heading.emphasis}
            />
          </div>
          {testimonials.lead && (
            <div className="home-testimonials__lead">
              <SiteLead text={testimonials.lead} />
            </div>
          )}
        </div>

        <div className="home-testimonials__wall">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="home-testimonials__column">
              {column.map((review, index) => {
                const featured = columnIndex === 1 && index === 0;
                return (
                  <figure
                    key={`${review.name}-${index}`}
                    className={`home-testimonials__card${featured ? " home-testimonials__card_tone_tint" : ""}`}
                  >
                    <span className="home-testimonials__mark" aria-hidden="true">
                      «
                    </span>
                    <blockquote className="home-testimonials__quote">
                      <p>{review.messages.map((message) => message.text).join(" ")}</p>
                    </blockquote>
                    <figcaption className="home-testimonials__who">
                      <span className="home-testimonials__avatar" aria-hidden="true">
                        {review.avatarInitial}
                      </span>
                      <b className="home-testimonials__name">{review.name}</b>
                      <span className="home-testimonials__stat">
                        <TrophyIcon className="home-testimonials__stat-icon" />
                        {review.stat.label}: {review.stat.value}
                      </span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </SiteSection>
  );
}
