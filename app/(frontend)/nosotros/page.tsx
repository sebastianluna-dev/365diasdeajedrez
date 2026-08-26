import type { Metadata } from "next";
import { SiteHeader } from "@/components/sections/common/site-header.section";
import { Footer } from "@/components/sections/common/footer.section";
import { NosotrosHeroSection } from "@/components/sections/nosotros/hero/hero.section";
import { ValoresSection } from "@/components/sections/nosotros/values/values.section";
import { NosotrosCtaSection } from "@/components/sections/nosotros/cta/cta.section";
import "./nosotros-page.css";

export const metadata: Metadata = {
  title: "Nosotros | 365 Días de Ajedrez",
  description:
    "365DiasDeAjedrez nació de años de competencia y de enseñanza. Conoce nuestra historia y los valores que guían cada clase.",
};

export default function NosotrosPage() {
  return (
    <div className="nosotros-page">
      <SiteHeader />
      <NosotrosHeroSection />
      <ValoresSection />
      <NosotrosCtaSection />
      <Footer />
    </div>
  );
}
