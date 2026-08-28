"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import type { Article } from "@/services/articles/articles.types";
import { ArticleCard } from "./article-card.comp";
import { CategoryFilter } from "./category-filter.comp";
import { Pagination } from "./pagination.comp";
import "./blog-articles.section.css";

const ALL_CATEGORY = "Todos";
const PER_PAGE = 9;
/** How long the outgoing grid fades before the new articles are committed. */
const SWAP_DELAY_MS = 190;

interface BlogArticlesProps {
  articles: Article[];
}

export function BlogArticles({ articles }: BlogArticlesProps) {
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [page, setPage] = useState(1);
  /** A queued change that is fading the current grid out before it takes effect. */
  const [pending, setPending] = useState<{ category: string; page: number } | null>(null);
  const [interacted, setInteracted] = useState(false);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (swapTimer.current && clearTimeout(swapTimer.current)), []);

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

  function transitionTo(nextCategory: string, nextPage: number) {
    if (nextCategory === category && nextPage === currentPage) return;
    if (swapTimer.current) clearTimeout(swapTimer.current);
    setInteracted(true);
    setPending({ category: nextCategory, page: nextPage });
    swapTimer.current = setTimeout(() => {
      setCategory(nextCategory);
      setPage(nextPage);
      setPending(null);
      swapTimer.current = null;
    }, SWAP_DELAY_MS);
  }

  const gridClassName = [
    "blog-articles__grid",
    interacted ? "blog-articles__grid_animated" : "",
    pending ? "blog-articles__grid_leaving" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="blog-articles">
      <div className="blog-articles__inner">
        <h1 className="blog-articles__title">Blog 365: Aprende, entrena y mejora tu ajedrez</h1>
        <p className="blog-articles__intro">
          Artículos, consejos y recursos para comprender mejor el ajedrez, entrenar con intención y seguir mejorando
          dentro y fuera del tablero.
        </p>

        <CategoryFilter
          categories={categories}
          active={pending?.category ?? category}
          onSelect={(next) => transitionTo(next, 1)}
        />

        <div key={`${category}-${currentPage}`} className={gridClassName}>
          {pageArticles.map((article, index) => (
            <ArticleCard
              key={article.slug}
              article={article}
              style={{ "--blog-card-index": index } as CSSProperties}
            />
          ))}
        </div>

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          onSelect={(next) => transitionTo(category, next)}
          onPrev={() => transitionTo(category, Math.max(1, currentPage - 1))}
          onNext={() => transitionTo(category, Math.min(totalPages, currentPage + 1))}
        />
      </div>
    </section>
  );
}
