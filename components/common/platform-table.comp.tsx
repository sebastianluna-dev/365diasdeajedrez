import type { ReactNode } from "react";
import "./platform-table.comp.css";

export interface PlatformTableColumn {
  label: string;
  align?: "right";
}

interface PlatformTableProps {
  columns: readonly (string | PlatformTableColumn)[];
  /** Filas (`PlatformTableRow`). Vacío ⇒ se pinta `emptyLabel`. */
  children?: ReactNode;
  emptyLabel?: string;
  /** Ancho mínimo antes de que la tabla haga scroll horizontal. */
  minWidth?: number;
}

/**
 * Tabla de la plataforma: `<table>` semántica y una sola definición del look
 * para los listados de profesor y staff (alumnos, clases, cursos…). Server
 * component: recibe las filas por children, no gestiona estado ni ordenación
 * (los filtros van por searchParams, en el servidor).
 */
export function PlatformTable({ columns, children, emptyLabel, minWidth = 640 }: PlatformTableProps) {
  const hasRows = Array.isArray(children) ? children.flat().some(Boolean) : Boolean(children);

  return (
    <div className="platform-table">
      <table className="platform-table__table" style={{ minWidth: `${minWidth}px` }}>
        <thead>
          <tr>
            {columns.map((column) => {
              const { label, align } = typeof column === "string" ? { label: column, align: undefined } : column;
              return (
                <th
                  key={label}
                  scope="col"
                  className={`platform-table__head${align === "right" ? " platform-table__head_align_right" : ""}`}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {hasRows ? (
            children
          ) : (
            <tr>
              <td className="platform-table__empty" colSpan={columns.length}>
                {emptyLabel ?? "No hay nada que mostrar todavía."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function PlatformTableRow({ children }: { children: ReactNode }) {
  return <tr className="platform-table__row">{children}</tr>;
}

interface PlatformTableCellProps {
  children: ReactNode;
  align?: "right";
  /** Celda destacada: la columna que identifica la fila. */
  strong?: boolean;
}

export function PlatformTableCell({ children, align, strong }: PlatformTableCellProps) {
  const modifiers = [align === "right" ? "platform-table__cell_align_right" : "", strong ? "platform-table__cell_variant_strong" : ""]
    .filter(Boolean)
    .join(" ");

  return <td className={`platform-table__cell${modifiers ? ` ${modifiers}` : ""}`}>{children}</td>;
}
