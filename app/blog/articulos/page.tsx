import type { Metadata } from "next";
import { ArticleHeader } from "@/components/sections/blog-article/header/article-header.comp";
import { ArchiveSection } from "@/components/sections/blog/archive/archive.section";
import { BlogFooter } from "@/components/sections/blog/footer/blog-footer.comp";
import { articles } from "@/data/articles.data";
import "../blog.css";

export const metadata: Metadata = {
  title: "Todos los artículos | 365 Días de Ajedrez",
  description:
    "Análisis de partidas, aperturas, táctica, finales y notas de método. Todo lo publicado en El Tablero, de lo más reciente a lo más antiguo.",
};

export default function ArticulosPage() {
  return (
    <div className="blog-page">
      <div className="blog-page__shell">
        <div className="blog-page__glow" />
        <ArticleHeader category="Archivo completo" date="Agosto 2026" />
        <ArchiveSection articles={articles} />
        <BlogFooter />
      </div>
    </div>
  );
}
