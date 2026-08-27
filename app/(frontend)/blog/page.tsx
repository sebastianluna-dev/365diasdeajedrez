import type { Metadata } from "next";
import { Header } from "@/components/sections/common/header/header.section";
import { ArchiveSection } from "@/components/sections/blog/archive/archive.section";
import { Footer } from "@/components/sections/common/footer/footer.section";
import { getPosts } from "@/services/posts/posts.service";
import "./blog.css";

export const metadata: Metadata = {
  title: "Blog | 365 Días de Ajedrez",
  description:
    "Análisis de partidas, aperturas, táctica, finales y notas de método. Todo lo publicado en El Tablero, de lo más reciente a lo más antiguo.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="blog-page">
      <div className="blog-page__shell">
        <div className="blog-page__glow" />
        <Header theme="light" />
        <ArchiveSection posts={posts} />
        <Footer accent="red" />
      </div>
    </div>
  );
}
