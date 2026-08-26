import type { Metadata } from "next";
import { Masthead } from "@/components/sections/blog/masthead/masthead.comp";
import { Ticker } from "@/components/sections/blog/ticker/ticker.comp";
import { BlogContent } from "@/components/sections/blog/blog-content/blog-content.section";
import { Footer } from "@/components/sections/common/footer/footer.section";
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
          <BlogContent />
        </div>

        <Footer accent="red" />
      </div>
    </div>
  );
}
