import { SiteHeader } from "../components/sections/common/site-header.comp";
import { HeroSection } from "../components/sections/homepage/hero/hero.section";
import { ProgramSection } from "../components/sections/homepage/program/program.section";
import { MentorsSection } from "../components/sections/homepage/mentors/mentors.section";
import { PlansSection } from "../components/sections/homepage/plans/plans.section";
import { ResourcesSection } from "../components/sections/homepage/resources/resources.section";
import { ReviewsAndFaqSection } from "../components/sections/homepage/reviews/reviews-and-faq.section";
import { StickyCtaAndFooter } from "../components/sections/homepage/cta/sticky-cta-and-footer.comp";

export default function LandingPage() {
  return (
    <div className="landingPage">
      <SiteHeader />
      <HeroSection />
      <ProgramSection />
      <MentorsSection />
      <PlansSection />
      <ResourcesSection />
      <ReviewsAndFaqSection />
      <StickyCtaAndFooter />
    </div>
  );
}
