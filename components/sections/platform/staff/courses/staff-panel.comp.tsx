import type { ReactNode } from "react";
import "./staff-panel.comp.css";

interface StaffPanelProps {
  title: string;
  /** Un dato corto junto al título: «5 capítulos · 162 lecciones». */
  meta?: string;
  /** La acción de la tarjeta, alineada al filo derecho de su cabecera. */
  action?: ReactNode;
  /** Frase de contexto bajo la cabecera, cuando la tarjeta no se explica sola. */
  description?: string;
  children: ReactNode;
}

/**
 * Una tarjeta del panel de cursos: cabecera con título, dato y acción, y debajo
 * el contenido.
 *
 * La cabecera lleva su propio filo a todo el ancho —con márgenes negativos que
 * anulan el relleno— porque una raya que no llega a los bordes se lee como un
 * subrayado del título en vez de como la división de la tarjeta.
 */
export function StaffPanel({ title, meta, action, description, children }: StaffPanelProps) {
  return (
    <section className="staff-panel">
      <header className="staff-panel__head">
        <h2 className="staff-panel__title">{title}</h2>
        {meta && <span className="staff-panel__meta">{meta}</span>}
        {action && <div className="staff-panel__action">{action}</div>}
      </header>

      {description && <p className="staff-panel__description">{description}</p>}

      {children}
    </section>
  );
}
