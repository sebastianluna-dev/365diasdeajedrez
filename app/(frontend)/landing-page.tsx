import { siteConfig } from "@/config/site.config";
import { SiteHeader } from "@/components/site/sections/shell/site-header/site-header.section";
import { SiteFooter } from "@/components/site/sections/shell/site-footer/site-footer.section";
import { HeroSection } from "@/components/site/sections/home/hero/hero.section";
import { FiguresSection } from "@/components/site/sections/home/figures/figures.section";

/**
 * The academy's home («365 días de ajedrez»), in the order of the owner's
 * assembled design (2026-10-26), each section behind its switch in
 * config/site.config.ts. Its copy is config/academy-home.config.ts; the CMS
 * feeds the FAQ's questions, the testimonials and the WhatsApp number.
 */
export default function LandingPage() {
  const { sections } = siteConfig.home;

  return (
    <div className="site-page">
      <SiteHeader />
      <main id="contenido">
        {sections.hero && <HeroSection />}
        {sections.figures && <FiguresSection />}
      </main>
      <SiteFooter />
    </div>
  );
}
