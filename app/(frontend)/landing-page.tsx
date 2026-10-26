import { siteConfig } from "@/config/site.config";
import { caveat, fraunces, plexMono } from "@/app/(platform)/fonts";
import { SiteHeader } from "@/components/site/sections/shell/site-header/site-header.section";
import { SiteFooter } from "@/components/site/sections/shell/site-footer/site-footer.section";
import { HeroSection } from "@/components/site/sections/home/hero/hero.section";
import { FiguresSection } from "@/components/site/sections/home/figures/figures.section";
import { ClassesSection } from "@/components/site/sections/home/classes/classes.section";
import { TeamSection } from "@/components/site/sections/home/team/team.section";
import { CoursesSection } from "@/components/site/sections/home/courses/courses.section";
import { PlatformSection } from "@/components/site/sections/home/platform/platform.section";
import { AdventureSection } from "@/components/site/sections/home/adventure/adventure.section";

/**
 * The academy's home («365 días de ajedrez»), in the order of the owner's
 * assembled design (2026-10-26), each section behind its switch in
 * config/site.config.ts. Its copy is config/academy-home.config.ts; the CMS
 * feeds the FAQ's questions, the testimonials and the WhatsApp number.
 */
export default function LandingPage() {
  const { sections } = siteConfig.home;

  return (
    // The adventure's own three fonts (the notebook's print, hand and typed
    // data), for its map and rivals; none is preloaded, so only this page,
    // where they are drawn, downloads them.
    <div className={`site-page ${fraunces.variable} ${caveat.variable} ${plexMono.variable}`}>
      <SiteHeader />
      <main id="contenido">
        {sections.hero && <HeroSection />}
        {sections.figures && <FiguresSection />}
        {sections.classes && <ClassesSection />}
        {sections.team && <TeamSection />}
        {sections.courses && <CoursesSection />}
        {sections.platform && <PlatformSection />}
        {sections.adventure && <AdventureSection />}
      </main>
      <SiteFooter />
    </div>
  );
}
