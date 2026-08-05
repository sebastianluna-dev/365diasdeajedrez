import "./pagination.comp.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onSelect: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Pagination({ page, totalPages, totalItems, onSelect, onPrev, onNext }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination">
      <span className="pagination__summary">
        Página {page} de {totalPages} · {totalItems} artículos
      </span>
      <div className="pagination__controls">
        <button
          type="button"
          aria-label="Página anterior"
          onClick={onPrev}
          className={`pagination__arrow${page <= 1 ? " pagination__arrow_disabled" : ""}`}
        >
          ←
        </button>
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            className={`pagination__page${n === page ? " pagination__page_active" : ""}`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          aria-label="Página siguiente"
          onClick={onNext}
          className={`pagination__arrow${page >= totalPages ? " pagination__arrow_disabled" : ""}`}
        >
          →
        </button>
      </div>
    </nav>
  );
}
