import Link from "next/link";
import "./empty-state.comp.css";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="empty-state__action">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
