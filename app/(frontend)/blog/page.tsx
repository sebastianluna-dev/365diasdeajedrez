import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/sections/shell/site-header/site-header.section";
import { BlogArticles } from "@/components/site/sections/blog/blog-articles/blog-articles.section";
import { SiteFooter } from "@/components/site/sections/shell/site-footer/site-footer.section";
import { categoriesOf, listingHref, parseListingQuery } from "@/services/articles/article-listing";
import { getArticleSummaries } from "@/services/articles/articles.service";
import "./blog.css";

interface BlogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// The category and the page travel in the URL, so the page renders per
// request; the data comes from the Data Cache (see articles.service.ts), not
// from Payload on every visit.
async function resolveQuery(searchParams: BlogPageProps["searchParams"]) {
  const [params, articles] = await Promise.all([searchParams, getArticleSummaries()]);
  return { articles, query: parseListingQuery(params, categoriesOf(articles)) };
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const { query } = await resolveQuery(searchParams);
  return {
    title: "Blog | 365 Días de Ajedrez",
    description:
      "Análisis de partidas, aperturas, táctica, finales y notas de método. Todo lo publicado en El Tablero, de lo más reciente a lo más antiguo.",
    alternates: { canonical: listingHref(query) },
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { articles, query } = await resolveQuery(searchParams);

  return (
    <div className="blog-page">
      <div className="blog-page__shell">
        <div className="blog-page__glow" />
        <SiteHeader />
        <main id="contenido">
          <BlogArticles articles={articles} query={query} />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
