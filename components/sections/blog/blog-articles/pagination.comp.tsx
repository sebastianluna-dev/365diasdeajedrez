import Link from "next/link";
import "./pagination.comp.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  /** URL de cada página; paginar es navegar. */
  hrefFor: (page: number) => string;
}

export function Pagination({ page, totalPages, totalItems, hrefFor }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="pagination" aria-label="Páginas del blog">
      <span className="pagination__summary">
        Página {page} de {totalPages} · {totalItems} artículos
      </span>
      <div className="pagination__controls">
        {page <= 1 ? (
          <span aria-hidden="true" className="pagination__arrow pagination__arrow_disabled">
            ←
          </span>
        ) : (
          <Link href={hrefFor(page - 1)} aria-label="Página anterior" className="pagination__arrow">
            ←
          </Link>
        )}
        {pages.map((number) => (
          <Link
            key={number}
            href={hrefFor(number)}
            aria-current={number === page ? "page" : undefined}
            className={`pagination__page${number === page ? " pagination__page_active" : ""}`}
          >
            {number}
          </Link>
        ))}
        {page >= totalPages ? (
          <span aria-hidden="true" className="pagination__arrow pagination__arrow_disabled">
            →
          </span>
        ) : (
          <Link href={hrefFor(page + 1)} aria-label="Página siguiente" className="pagination__arrow">
            →
          </Link>
        )}
      </div>
    </nav>
  );
}
