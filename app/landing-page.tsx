import "./landing.css";
import { HeroSection } from "../components/sections/homepage/HeroSection";
import { ProgramSection } from "../components/sections/homepage/ProgramSection";
import { MentorsSection } from "../components/sections/homepage/MentorsSection";
import { PlansSection } from "../components/sections/homepage/PlansSection";
import { ResourcesSection } from "../components/sections/homepage/ResourcesSection";
import { ReviewsAndFaqSection } from "../components/sections/homepage/ReviewsAndFaqSection";
import { StickyCtaAndFooter } from "../components/sections/homepage/StickyCtaAndFooter";

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
