import { siteConfig, getHomeMentorsSlot } from "@/config/site.config";
import { getHomeData } from "@/lib/payload/get-home-data";
import { getMediaUrl } from "@/lib/payload/get-media-url";
import { SiteHeader } from "@/components/sections/common/site-header.section";
import { Footer } from "@/components/sections/common/footer.section";
import { HeroSection } from "@/components/sections/homepage/hero/hero.section";
import { ProgramSection } from "@/components/sections/homepage/program/program.section";
import { MentorsSection } from "@/components/sections/homepage/mentors/mentors.section";
import { TeacherSection } from "@/components/sections/homepage/teacher/teacher.section";
import { PlansSection } from "@/components/sections/homepage/plans/plans.section";
import { ResourcesSection } from "@/components/sections/homepage/resources/resources.section";
import { ReviewsSection } from "@/components/sections/homepage/reviews/reviews.section";
import { FaqSection } from "@/components/sections/homepage/faq/faq.section";
import { CtaSection } from "@/components/sections/homepage/cta/cta.section";
import type { MoveAnnotations } from "@/hooks/use-chess-replay.hook";

export default async function LandingPage() {
  const { sections } = siteConfig.home;
  const mentorsSlot = getHomeMentorsSlot();
  const { hero, program, teacher, packages, faq } = await getHomeData();

  return (
    <div className="landingPage">
      <SiteHeader />
      {sections.hero && (
        <HeroSection
          title={hero.title}
          description={hero.description}
          imageUrl={getMediaUrl(hero.image)}
          cta={hero.cta}
        />
      )}
      {sections.program && (
        <ProgramSection
          sectionTitle={program.sectionTitle}
          sectionDescription={program.sectionDescription}
          note={program.note ?? undefined}
          modules={program.modules}
        />
      )}
      {mentorsSlot === "teacher" && (
        <TeacherSection
          eyebrow={teacher.eyebrow}
          name={teacher.name}
          badge={teacher.badge}
          summary={teacher.summary}
          photoUrl={getMediaUrl(teacher.photo)}
          ctaLabel={teacher.ctaLabel}
          stats={teacher.stats}
          eloLabel={teacher.eloLabel}
          eloRatings={teacher.eloRatings}
          game={{
            title: teacher.game.title,
            paragraphs: teacher.game.paragraphs,
            moves: teacher.game.moves,
            flipBoard: teacher.game.flipBoard,
            annotations: (teacher.game.annotations as MoveAnnotations | null) ?? undefined,
          }}
        />
      )}
      {mentorsSlot === "mentors" && <MentorsSection />}
      {sections.plans && (
        <PlansSection
          sectionTitle={packages.sectionTitle}
          sectionDescription={packages.sectionDescription}
          plans={[packages.packageOne, packages.packageTwo]}
        />
      )}
      {sections.resources && <ResourcesSection />}
      {sections.reviews && <ReviewsSection />}
      {sections.faq && (
        <FaqSection
          eyebrow={faq.eyebrow}
          sectionTitle={faq.sectionTitle}
          sectionDescription={faq.sectionDescription}
          ctaLabel={faq.ctaLabel}
          questions={faq.questions}
        />
      )}
      <CtaSection />
      <Footer />
    </div>
  );
}
