import type { Metadata } from "next";
import { Masthead } from "@/components/sections/blog/masthead/masthead.comp";
import { Ticker } from "@/components/sections/blog/ticker/ticker.comp";
import { Portada } from "@/components/sections/blog/portada/portada.section";
import { MoreSection } from "@/components/sections/blog/more-section/more-section.section";
import { BlogFooter } from "@/components/sections/blog/footer/blog-footer.comp";
import "./blog.css";

export const metadata: Metadata = {
  title: "Blog | 365 Días de Ajedrez",
  description:
    "Artículos de estrategia, tácticas, aperturas y análisis de partidas para entrenar con intención.",
};

export default function BlogPage() {
  return (
    <div className="blog-page">
      <div className="blog-page__shell">
        <div className="blog-page__glow" />

        <div className="blog-page__wrap">
          <Masthead />
          <Ticker />
          <Portada />
          <MoreSection />
        </div>

        <BlogFooter />
      </div>
    </div>
  );
}
