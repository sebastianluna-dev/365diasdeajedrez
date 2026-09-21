import type { ComponentPropsWithoutRef, ReactNode } from "react";
import "./platform-table.comp.css";

export interface PlatformTableColumn {
  label: string;
  align?: "right";
}

interface PlatformTableProps {
  columns: readonly (string | PlatformTableColumn)[];
  /** Rows (`PlatformTableRow`). Empty ⇒ `emptyLabel` is rendered. */
  children?: ReactNode;
  emptyLabel?: string;
  /** Minimum width before the table scrolls horizontally. */
  minWidth?: number;
}

/**
 * Platform table: a semantic `<table>` and a single definition of the look
 * for the teacher and staff listings (students, classes, courses…). Server
 * component: it receives the rows as children and manages neither state nor
 * sorting (filters go through searchParams, on the server).
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

interface PlatformTableRowProps extends ComponentPropsWithoutRef<"tr"> {
  children: ReactNode;
}

/**
 * A row. It takes whatever a `<tr>` takes — a class of the caller's own, the
 * drag handlers of a sortable list — because the table owns the look of the
 * rows and not what happens to them.
 */
export function PlatformTableRow({ children, className, ...rest }: PlatformTableRowProps) {
  return (
    <tr className={`platform-table__row${className ? ` ${className}` : ""}`} {...rest}>
      {children}
    </tr>
  );
}

interface PlatformTableCellProps {
  children: ReactNode;
  align?: "right";
  /** Highlighted cell: the column that identifies the row. */
  strong?: boolean;
}

export function PlatformTableCell({ children, align, strong }: PlatformTableCellProps) {
  const modifiers = [
    align === "right" ? "platform-table__cell_align_right" : "",
    strong ? "platform-table__cell_variant_strong" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <td className={`platform-table__cell${modifiers ? ` ${modifiers}` : ""}`}>{children}</td>;
}
