import Link from "next/link";
import "./sidebar-card.comp.css";

export function SidebarCard() {
  return (
    <div className="sidebar-card">
      <h4 className="sidebar-card__title">Clase abierta cada jueves</h4>
      <p className="sidebar-card__text">Una hora en vivo, análisis de posiciones y preguntas al final.</p>
      <Link href="/#planes" className="blog-button blog-button_variant_primary">
        Reservar lugar
      </Link>
    </div>
  );
}
