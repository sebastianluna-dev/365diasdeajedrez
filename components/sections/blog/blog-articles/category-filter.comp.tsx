import "./category-filter.comp.css";

interface CategoryFilterProps {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, active, onSelect }: CategoryFilterProps) {
  return (
    <div className="category-filter">
      <span className="category-filter__label">Filtrar</span>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={`category-filter__button${category === active ? " category-filter__button_active" : ""}`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
