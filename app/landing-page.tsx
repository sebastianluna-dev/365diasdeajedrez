import { siteConfig, getHomeMentorsSlot } from "@/config/site.config";
import { SiteHeader } from "../components/sections/common/site-header.comp";
import { HeroSection } from "../components/sections/homepage/hero/hero.section";
import { ProgramSection } from "../components/sections/homepage/program/program.section";
import { MentorsSection } from "../components/sections/homepage/mentors/mentors.section";
import { TeacherSection } from "../components/sections/homepage/teacher/teacher.section";
import { PlansSection } from "../components/sections/homepage/plans/plans.section";
import { ResourcesSection } from "../components/sections/homepage/resources/resources.section";
import { ReviewsSection } from "../components/sections/homepage/reviews/reviews.section";
import { FaqSection } from "../components/sections/homepage/faq/faq.section";
import { CtaSection } from "../components/sections/homepage/cta/cta.section";

export default function LandingPage() {
  const { sections } = siteConfig.home;
  const mentorsSlot = getHomeMentorsSlot();

  return (
    <div className="landingPage">
      <SiteHeader />
      {sections.hero && <HeroSection />}
      {sections.program && <ProgramSection />}
      {mentorsSlot === "teacher" && <TeacherSection />}
      {mentorsSlot === "mentors" && <MentorsSection />}
      {sections.plans && <PlansSection />}
      {sections.resources && <ResourcesSection />}
      {sections.reviews && <ReviewsSection />}
      {sections.faq && <FaqSection />}
      <CtaSection />
    </div>
  );
}
