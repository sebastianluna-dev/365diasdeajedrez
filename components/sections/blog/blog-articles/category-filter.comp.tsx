import Link from "next/link";
import "./category-filter.comp.css";

interface CategoryFilterProps {
  categories: string[];
  active: string;
  /** URL de cada categoría; el filtro es navegación, no estado. */
  hrefFor: (category: string) => string;
}

export function CategoryFilter({ categories, active, hrefFor }: CategoryFilterProps) {
  return (
    <nav className="category-filter" aria-label="Filtrar por categoría">
      <span className="category-filter__label">Filtrar</span>
      {categories.map((category) => (
        <Link
          key={category}
          href={hrefFor(category)}
          aria-current={category === active ? "page" : undefined}
          className={`category-filter__button${category === active ? " category-filter__button_active" : ""}`}
        >
          {category}
        </Link>
      ))}
    </nav>
  );
}
