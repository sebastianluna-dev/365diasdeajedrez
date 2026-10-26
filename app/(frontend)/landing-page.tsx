import { siteConfig, getHomeMentorsSlot } from "@/config/site.config";
import { SiteHeader } from "@/components/site/sections/shell/site-header/site-header.section";
import { SiteFooter } from "@/components/site/sections/shell/site-footer/site-footer.section";
import { HeroSection } from "@/components/site/sections/home/hero/hero.section";
import { ProgramSection } from "@/components/site/sections/home/program/program.section";
import { MentorsSection } from "@/components/site/sections/home/mentors/mentors.section";
import { TeacherSection } from "@/components/site/sections/home/teacher/teacher.section";
import { PlansSection } from "@/components/site/sections/home/plans/plans.section";
import { ResourcesSection } from "@/components/site/sections/home/resources/resources.section";
import { ReviewsSection } from "@/components/site/sections/home/reviews/reviews.section";
import { FaqSection } from "@/components/site/sections/home/faq/faq.section";
import { CtaSection } from "@/components/site/sections/home/cta/cta.section";

export default function LandingPage() {
  const { sections } = siteConfig.home;
  const mentorsSlot = getHomeMentorsSlot();

  return (
    <div className="landing-page">
      <SiteHeader />
      {/* The sticky CTA and the footer stay outside <main>: they are complementary, not the content. */}
      <main id="contenido">
        {sections.hero && <HeroSection />}
        {sections.program && <ProgramSection />}
        {mentorsSlot === "teacher" && <TeacherSection />}
        {mentorsSlot === "mentors" && <MentorsSection />}
        {sections.plans && <PlansSection />}
        {sections.resources && <ResourcesSection />}
        {sections.faq && <FaqSection />}
        {sections.reviews && <ReviewsSection />}
      </main>
      <CtaSection />
      <SiteFooter />
    </div>
  );
}
