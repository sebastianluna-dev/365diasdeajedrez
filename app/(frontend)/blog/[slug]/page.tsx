import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/sections/common/header/header.section";
import { ArticleContent } from "@/components/sections/blog-article/content/article-content.comp";
import { RelatedArticles } from "@/components/sections/blog-article/related/related-articles.section";
import { Footer } from "@/components/sections/common/footer/footer.section";
import { getPostBySlug, getPosts } from "@/services/posts/posts.service";
import "../blog.css";
import "./article-page.css";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.metaTitle ?? post.title} | 365 Días de Ajedrez`,
    description: post.metaDescription ?? post.excerpt,
    openGraph: {
      images: post.ogImage ? [post.ogImage.src] : [post.image.src],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getPostBySlug(slug), getPosts()]);
  if (!post) notFound();

  const relatedPosts = posts.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <div className="article-page">
      <div className="article-page__glow article-page__glow_position_mid-right" />
      <div className="article-page__glow article-page__glow_position_top-left" />

      <Header theme="light" />
      <ArticleContent post={post} />
      <RelatedArticles posts={relatedPosts} />
      <Footer accent="red" />
    </div>
  );
}
