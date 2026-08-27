import type { Metadata } from "next";
import { Header } from "@/components/sections/common/header/header.section";
import { BlogArticles } from "@/components/sections/blog/blog-articles/blog-articles.section";
import { Footer } from "@/components/sections/common/footer/footer.section";
import { getArticles } from "@/services/articles/articles.service";
import "./blog.css";

export const metadata: Metadata = {
  title: "Blog | 365 Días de Ajedrez",
  description:
    "Análisis de partidas, aperturas, táctica, finales y notas de método. Todo lo publicado en El Tablero, de lo más reciente a lo más antiguo.",
};

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <div className="blog-page">
      <div className="blog-page__shell">
        <div className="blog-page__glow" />
        <Header theme="light" />
        <BlogArticles articles={articles} />
        <Footer accent="red" />
      </div>
    </div>
  );
}
