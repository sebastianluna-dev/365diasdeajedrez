import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/sections/common/site-header.comp";
import { Footer } from "@/components/sections/common/footer.comp";
import { MaestroHeroSection } from "@/components/sections/mentor-profile/maestro-hero/maestro-hero.section";
import { MentorVideoSection } from "@/components/sections/mentor-profile/video/video.section";
import { MentorGameSection } from "@/components/sections/mentor-profile/game/game.section";
import { MentorOthersSection } from "@/components/sections/mentor-profile/other-mentors/other-mentors.section";
import { MentorCtaSection } from "@/components/sections/mentor-profile/cta/cta.section";
import { mentors } from "@/data/mentors.data";
import "./maestro-profile.css";

interface MaestroPageProps {
  params: Promise<{ maestroName: string }>;
}

export function generateStaticParams() {
  return mentors.map((mentor) => ({ maestroName: mentor.slug }));
}

export async function generateMetadata({ params }: MaestroPageProps): Promise<Metadata> {
  const { maestroName } = await params;
  const mentor = mentors.find((m) => m.slug === maestroName);
  if (!mentor) return {};
  return {
    title: `${mentor.name} | 365 Días de Ajedrez`,
    description: mentor.summary,
  };
}

export default async function MaestroProfilePage({ params }: MaestroPageProps) {
  const { maestroName } = await params;
  const mentor = mentors.find((m) => m.slug === maestroName);
  if (!mentor) notFound();

  return (
    <div className="maestro-profile-page">
      <div aria-hidden="true" className="maestro-profile-page__glow" />

      <SiteHeader />

      <MaestroHeroSection mentor={mentor} />
      <MentorVideoSection mentor={mentor} />
      <MentorGameSection mentor={mentor} />
      <MentorOthersSection mentors={mentors} currentSlug={mentor.slug} />
      <MentorCtaSection />

      <Footer />
    </div>
  );
}
