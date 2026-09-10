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

// Server Component: el filtro y la página llegan de la URL y se resuelven aquí.
// Antes era un Client Component que recibía todos los artículos —con su cuerpo—
// y filtraba en `useState`, con lo que nada más allá de la primera página
// tenía dirección propia.
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
