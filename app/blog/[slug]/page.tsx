import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleHeader } from "@/components/sections/blog-article/header/article-header.comp";
import { ArticleContent } from "@/components/sections/blog-article/content/article-content.comp";
import { RelatedArticles } from "@/components/sections/blog-article/related/related-articles.section";
import { BlogFooter } from "@/components/sections/blog/footer/blog-footer.comp";
import { articles } from "@/data/articles.data";
import "../blog.css";
import "./article-page.css";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return articles.filter((article) => article.body).map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) return {};
  return {
    title: `${article.title} | 365 Días de Ajedrez`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article || !article.body) notFound();

  const date = article.meta?.split(" · ")[0] ?? "";
  const relatedArticles = articles.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <div className="article-page">
      <div className="article-page__glow article-page__glow_position_mid-right" />
      <div className="article-page__glow article-page__glow_position_top-left" />

      <ArticleHeader category={article.category} date={date} />
      <ArticleContent article={article} />
      <RelatedArticles articles={relatedArticles} />
      <BlogFooter />
    </div>
  );
}
