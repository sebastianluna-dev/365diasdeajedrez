import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header.comp";
import { SiteFooter } from "@/components/layout/site-footer.comp";
import { MentorHeroSection } from "@/components/sections/mentor-profile/hero/hero.section";
import { MentorVideoSection } from "@/components/sections/mentor-profile/video/video.section";
import { MentorGameSection } from "@/components/sections/mentor-profile/game/game.section";
import { MentorOthersSection } from "@/components/sections/mentor-profile/other-mentors/other-mentors.section";
import { MentorCtaSection } from "@/components/sections/mentor-profile/cta/cta.section";
import { mentors } from "@/data/mentors.data";
import "./mentor-profile.css";

interface MentorPageProps {
  params: Promise<{ mentorName: string }>;
}

export function generateStaticParams() {
  return mentors.map((mentor) => ({ mentorName: mentor.slug }));
}

export async function generateMetadata({ params }: MentorPageProps): Promise<Metadata> {
  const { mentorName } = await params;
  const mentor = mentors.find((m) => m.slug === mentorName);
  if (!mentor) return {};
  return {
    title: `${mentor.name} | 365 Días de Ajedrez`,
    description: mentor.summary,
  };
}

export default async function MentorProfilePage({ params }: MentorPageProps) {
  const { mentorName } = await params;
  const mentor = mentors.find((m) => m.slug === mentorName);
  if (!mentor) notFound();

  return (
    <div className="mentor-profile-page">
      <div aria-hidden="true" className="mentor-profile-page__glow" />

      <div className="mentor-profile-page__nav">
        <div className="mentor-profile-page__nav-inner">
          <div className="mentor-profile-page__nav-bar">
            <SiteHeader ctaLabel="Agenda una llamada" />
          </div>
          <div className="mentor-profile-page__nav-spacer" />
        </div>
      </div>

      <MentorHeroSection mentor={mentor} />
      <MentorVideoSection mentor={mentor} />
      <MentorGameSection mentor={mentor} />
      <MentorOthersSection mentors={mentors} currentSlug={mentor.slug} />
      <MentorCtaSection />

      <SiteFooter />
    </div>
  );
}
