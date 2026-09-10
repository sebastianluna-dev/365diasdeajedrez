import type { CSSProperties } from "react";
import { listingHref, selectArticles, type ArticleListingQuery } from "@/services/articles/article-listing";
import type { ArticleSummary } from "@/services/articles/articles.types";
import { ArticleCard } from "./article-card.comp";
import { CategoryFilter } from "./category-filter.comp";
import { Pagination } from "./pagination.comp";
import "./blog-articles.section.css";

interface BlogArticlesProps {
  articles: ArticleSummary[];
  query: ArticleListingQuery;
}

// Server Component: the filter and the page come from the URL and are resolved here.
// It used to be a Client Component that received every article — body
// included — and filtered in `useState`, so nothing beyond the first page
// had an address of its own.
export function BlogArticles({ articles, query }: BlogArticlesProps) {
  const listing = selectArticles(articles, query);

  return (
    <section className="blog-articles">
      <div className="blog-articles__inner">
        <h1 className="blog-articles__title">Blog 365: Aprende, entrena y mejora tu ajedrez</h1>
        <p className="blog-articles__intro">
          Artículos, consejos y recursos para comprender mejor el ajedrez, entrenar con intención y seguir mejorando
          dentro y fuera del tablero.
        </p>

        <CategoryFilter
          categories={listing.categories}
          active={listing.category}
          hrefFor={(category) => listingHref({ category, page: 1 })}
        />

        <div className="blog-articles__grid">
          {listing.items.map((article, index) => (
            <ArticleCard key={article.slug} article={article} style={{ "--blog-card-index": index } as CSSProperties} />
          ))}
        </div>

        <Pagination
          page={listing.page}
          totalPages={listing.totalPages}
          totalItems={listing.totalItems}
          hrefFor={(page) => listingHref({ category: listing.category, page })}
        />
      </div>
    </section>
  );
}
