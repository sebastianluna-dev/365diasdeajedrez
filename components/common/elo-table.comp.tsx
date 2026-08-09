import type { ReactNode } from "react";
import "./elo-table.comp.css";

interface EloTableProps {
  children: ReactNode;
  columns?: 3 | 4;
  className?: string;
}

interface EloItemProps {
  label: string;
  value: number | string;
}

export function EloTable({ children, columns = 3, className = "" }: EloTableProps) {
  return (
    <div className={`elo-table elo-table_columns_${columns} ${className}`.trim()}>
      {children}
    </div>
  );
}

function EloItem({ label, value }: EloItemProps) {
  return (
    <div className="elo-item">
      <span className="elo-item__label">{label}</span>
      <span className="elo-item__value">{value}</span>
    </div>
  );
}

EloTable.EloItem = EloItem;
