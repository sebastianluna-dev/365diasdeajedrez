"use client";

import { useMemo, useState } from "react";
import type { Article } from "@/services/articles/articles.types";
import { ArticleCard } from "./article-card.comp";
import { CategoryFilter } from "./category-filter.comp";
import { Pagination } from "./pagination.comp";
import "./blog-articles.section.css";

const ALL_CATEGORY = "Todos";
const PER_PAGE = 9;

interface BlogArticlesProps {
  articles: Article[];
}

export function BlogArticles({ articles }: BlogArticlesProps) {
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(articles.map((article) => article.category).filter((value): value is string => !!value)),
    );
    return [ALL_CATEGORY, ...unique];
  }, [articles]);

  const filtered = useMemo(
    () => (category === ALL_CATEGORY ? articles : articles.filter((article) => article.category === category)),
    [articles, category],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pageArticles = filtered.slice(start, start + PER_PAGE);

  function selectCategory(next: string) {
    setCategory(next);
    setPage(1);
  }

  return (
    <section className="blog-articles">
      <div className="blog-articles__inner">
        <h1 className="blog-articles__title">Blog 365: Aprende, entrena y mejora tu ajedrez</h1>
        <p className="blog-articles__intro">
          Artículos, consejos y recursos para comprender mejor el ajedrez, entrenar con intención y seguir mejorando
          dentro y fuera del tablero.
        </p>

        <CategoryFilter categories={categories} active={category} onSelect={selectCategory} />

        <div className="blog-articles__grid">
          {pageArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          onSelect={setPage}
          onPrev={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
        />
      </div>
    </section>
  );
}
