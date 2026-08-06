"use client";

import { useMemo, useState } from "react";
import type { Article } from "@/interfaces/article.interface";
import { PostCard } from "@/components/sections/blog/blog-content/post-card.comp";
import { CategoryFilter } from "./category-filter.comp";
import { Pagination } from "./pagination.comp";
import "./archive.section.css";

const CATEGORIES = ["Todos", "Aperturas", "Táctica", "Estrategia", "Finales", "Análisis de partidas"];
const PER_PAGE = 9;

interface ArchiveSectionProps {
  articles: Article[];
}

export function ArchiveSection({ articles }: ArchiveSectionProps) {
  const [category, setCategory] = useState("Todos");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (category === "Todos" ? articles : articles.filter((article) => article.category === category)),
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
    <section className="archive">
      <div className="archive__inner">
        <span className="eyebrow">Archivo</span>
        <h1 className="archive__title">Todos los artículos</h1>
        <p className="archive__intro">
          Análisis de partidas, aperturas, táctica, finales y notas de método. Todo lo publicado en El Tablero, de lo
          más reciente a lo más antiguo.
        </p>

        <CategoryFilter categories={CATEGORIES} active={category} onSelect={selectCategory} />

        <div className="archive__grid">
          {pageArticles.map((article) => (
            <PostCard key={article.slug} article={article} />
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
