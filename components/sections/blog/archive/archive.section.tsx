"use client";

import { useMemo, useState } from "react";
import type { PostContent } from "@/services/posts/posts.types";
import { PostCard } from "@/components/sections/blog/blog-content/post-card.comp";
import { CategoryFilter } from "./category-filter.comp";
import { Pagination } from "./pagination.comp";
import "./archive.section.css";

const ALL_CATEGORY = "Todos";
const PER_PAGE = 9;

interface ArchiveSectionProps {
  posts: PostContent[];
}

export function ArchiveSection({ posts }: ArchiveSectionProps) {
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(posts.map((post) => post.category).filter((value): value is string => !!value)));
    return [ALL_CATEGORY, ...unique];
  }, [posts]);

  const filtered = useMemo(
    () => (category === ALL_CATEGORY ? posts : posts.filter((post) => post.category === category)),
    [posts, category],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pagePosts = filtered.slice(start, start + PER_PAGE);

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

        <CategoryFilter categories={categories} active={category} onSelect={selectCategory} />

        <div className="archive__grid">
          {pagePosts.map((post) => (
            <PostCard key={post.slug} post={post} />
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
