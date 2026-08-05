import { SiteHeader } from "../components/sections/common/site-header.comp";
import { HeroSection } from "../components/sections/homepage/hero/hero.section";
import { ProgramSection } from "../components/sections/homepage/program/program.section";
import { MentorsSection } from "../components/sections/homepage/mentors/mentors.section";
import { PlansSection } from "../components/sections/homepage/plans/plans.section";
import { ResourcesSection } from "../components/sections/homepage/resources/resources.section";
import { ReviewsSection } from "../components/sections/homepage/reviews/reviews.section";
import { FaqSection } from "../components/sections/homepage/faq/faq.section";
import { CtaSection } from "../components/sections/homepage/cta/cta.section";

export default function LandingPage() {
  return (
    <div className="landingPage">
      <SiteHeader />
      <HeroSection />
      <ProgramSection />
      <MentorsSection />
      <PlansSection />
      <ResourcesSection />
      <ReviewsSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}
