import { HeroSection } from "../components/sections/homepage/hero/HeroSection";
import { ProgramSection } from "../components/sections/homepage/program/ProgramSection";
import { MentorsSection } from "../components/sections/homepage/mentors/MentorsSection";
import { PlansSection } from "../components/sections/homepage/plans/PlansSection";
import { ResourcesSection } from "../components/sections/homepage/resources/ResourcesSection";
import { ReviewsAndFaqSection } from "../components/sections/homepage/reviews/ReviewsAndFaqSection";
import { StickyCtaAndFooter } from "../components/sections/homepage/cta/StickyCtaAndFooter";

export default function LandingPage() {
  return (
    <div className="landingPage">
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
