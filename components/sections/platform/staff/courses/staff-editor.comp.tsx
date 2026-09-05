import Link from "next/link";
import type { ReactNode } from "react";
import "./staff-editor.comp.css";

export interface Crumb {
  label: string;
  href: string;
}

interface StaffEditorHeadProps {
  /** El camino hasta aquí SIN el sitio actual, que se pone con `title`. */
  crumbs?: Crumb[];
  title: string;
  /** Datos cortos bajo el título: estado, identificador, cuántas lecciones… */
  meta?: ReactNode;
  /** Lo que se puede hacer con esto, arriba a la derecha. */
  actions?: ReactNode;
  description?: string;
}

/**
 * Cabecera de las cuatro pantallas de cursos del panel: migas, título, datos
 * cortos y acciones.
 *
 * Vive aquí y no en cada página porque el camino curso → capítulo → lección
 * tiene cuatro niveles: sin una miga en todas, la única forma de subir un
 * escalón es el botón de atrás del navegador.
 */
export function StaffEditorHead({ crumbs, title, meta, actions, description }: StaffEditorHeadProps) {
  // Sin migas es una pantalla de primer nivel y su título pesa lo mismo que el
  // de «Alumnos» o «Profesores»; con migas está colgando de algo y baja un
  // escalón, para que la jerarquía se vea sin leer la ruta.
  const isRoot = !crumbs || crumbs.length === 0;

  return (
    <header className={`staff-editor-head${isRoot ? " staff-editor-head_level_root" : ""}`}>
      {!isRoot && (
        <nav className="staff-editor-head__crumbs" aria-label="Ruta">
          {crumbs?.map((crumb) => (
            <span key={crumb.href} className="staff-editor-head__crumb">
              <Link href={crumb.href} className="staff-editor-head__crumb-link">
                {crumb.label}
              </Link>
              <span className="staff-editor-head__separator" aria-hidden="true">
                /
              </span>
            </span>
          ))}
          {/* El sitio actual cierra la miga y no es un enlace: ya se está aquí. */}
          <span className="staff-editor-head__current">{title}</span>
        </nav>
      )}

      <div className="staff-editor-head__bar">
        <div className="staff-editor-head__heading">
          <h1 className="staff-editor-head__title">{title}</h1>
          {description && <p className="staff-editor-head__description">{description}</p>}
          {meta && <div className="staff-editor-head__meta">{meta}</div>}
        </div>

        {actions && <div className="staff-editor-head__actions">{actions}</div>}
      </div>
    </header>
  );
}

interface StaffEditorLayoutProps {
  children: ReactNode;
  /** La columna estrecha: resúmenes y acciones sueltas, nunca el trabajo principal. */
  aside?: ReactNode;
}

/**
 * Dos columnas: el trabajo a la izquierda y a la derecha lo que se consulta de
 * reojo. La estrecha va en píxeles y no en fracciones para que no se estire en
 * pantallas anchas, donde una lista de cuatro cifras a media pantalla se ve
 * vacía.
 */
export function StaffEditorLayout({ children, aside }: StaffEditorLayoutProps) {
  return (
    <div className={`staff-editor${aside ? "" : " staff-editor_layout_single"}`}>
      <div className="staff-editor__main">{children}</div>
      {aside && <aside className="staff-editor__aside">{aside}</aside>}
    </div>
  );
}
