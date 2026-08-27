import { getReviewsData } from "@/services/home/home.service";
import { ReviewsInteractive } from "./reviews-interactive.comp";
import "./reviews.section.css";

export async function ReviewsSection() {
  const content = await getReviewsData();

  return (
    <section id="reviews" className="section section_theme_light reviews">
      <div className="section__inner">
        <div className="reviews__head">
          <h2 className="reviews__title">{content.sectionTitle}</h2>
          <div className="reviews__divider" />
        </div>

        <ReviewsInteractive reviews={content.reviews} />
      </div>
    </section>
  );
}
