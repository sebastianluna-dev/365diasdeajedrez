import type { Metadata } from "next";
import { Header } from "@/components/site/sections/shell/header/header.section";
import { Footer } from "@/components/site/sections/shell/footer/footer.section";
import { NosotrosHeroSection } from "@/components/site/sections/nosotros/hero/hero.section";
import { ValoresSection } from "@/components/site/sections/nosotros/values/values.section";
import { NosotrosCtaSection } from "@/components/site/sections/nosotros/cta/cta.section";
import "./nosotros-page.css";

export const metadata: Metadata = {
  title: "Nosotros | 365 Días de Ajedrez",
  description:
    "365DiasDeAjedrez nació de años de competencia y de enseñanza. Conoce nuestra historia y los valores que guían cada clase.",
  alternates: { canonical: "/nosotros" },
};

export default function NosotrosPage() {
  return (
    <div className="nosotros-page">
      <Header />
      <main id="contenido">
        <NosotrosHeroSection />
        <ValoresSection />
        <NosotrosCtaSection />
      </main>
      <Footer />
    </div>
  );
}
