import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/sections/common/header/header.section";
import { ArticleContent } from "@/components/sections/blog-article/article-content/article-content.section";
import { RelatedArticles } from "@/components/sections/blog-article/related-articles/related-articles.section";
import { Footer } from "@/components/sections/common/footer/footer.section";
import { getArticleBySlug, getArticles } from "@/services/articles/articles.service";
import "../blog.css";
import "./article-page.css";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.metaTitle ?? article.title} | 365 Días de Ajedrez`,
    description: article.metaDescription ?? article.excerpt,
    openGraph: {
      images: article.ogImage ? [article.ogImage.src] : [article.image.src],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, articles] = await Promise.all([getArticleBySlug(slug), getArticles()]);
  if (!article) notFound();

  const relatedArticles = articles.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <div className="article-page">
      <div className="article-page__glow article-page__glow_position_mid-right" />
      <div className="article-page__glow article-page__glow_position_top-left" />

      <Header theme="light" />
      <ArticleContent article={article} />
      <RelatedArticles articles={relatedArticles} />
      <Footer accent="red" />
    </div>
  );
}
