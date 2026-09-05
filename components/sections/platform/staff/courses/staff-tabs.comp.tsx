import Link from "next/link";
import "./staff-tabs.comp.css";

export interface StaffTab {
  label: string;
  href: string;
  /** Un dato corto junto al rótulo: cuántas partidas hay, por ejemplo. */
  count?: number;
}

interface StaffTabsProps {
  tabs: StaffTab[];
  /** La pestaña en la que se está; se compara con `href`. */
  current: string;
}

/**
 * Navegación interna de una ficha del panel: curso y capítulo se reparten en
 * pestañas que son PÁGINAS.
 *
 * Son enlaces, no estado: cada pestaña tiene su URL, así que se puede compartir,
 * el botón de atrás funciona y cada una carga sólo sus datos —la lista de
 * partidas de un curso son cientos de filas y no tiene por qué viajar cada vez
 * que alguien entra a cambiarle el nombre—.
 */
export function StaffTabs({ tabs, current }: StaffTabsProps) {
  return (
    <nav className="staff-tabs" aria-label="Secciones de la ficha">
      {tabs.map((tab) => {
        const isActive = tab.href === current;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`staff-tabs__tab${isActive ? " staff-tabs__tab_state_active" : ""}`}
          >
            {tab.label}
            {tab.count !== undefined && <span className="staff-tabs__count">{tab.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
