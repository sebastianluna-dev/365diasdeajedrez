import Link from "next/link";
import "./ticker.comp.css";

const categories = [
  { href: "#aperturas", label: "Aperturas", count: "12" },
  { href: "#tactica", label: "Táctica", count: "09" },
  { href: "#estrategia", label: "Estrategia", count: "07" },
  { href: "#finales", label: "Finales", count: "06" },
  { href: "#analisis", label: "Análisis de partidas", count: "11" },
];

export function Ticker() {
  return (
    <div className="ticker">
      <span className="ticker__label">En esta edición</span>
      <div className="ticker__items">
        {categories.map((category) => (
          <Link key={category.href} href={category.href} className="ticker__item">
            {category.label} <span className="ticker__item-count">{category.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
