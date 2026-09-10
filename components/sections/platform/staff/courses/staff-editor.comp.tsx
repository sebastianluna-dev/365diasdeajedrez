import Link from "next/link";
import type { ReactNode } from "react";
import "./staff-editor.comp.css";

export interface Crumb {
  label: string;
  href: string;
}

interface StaffEditorHeadProps {
  /** The trail up to here WITHOUT the current place, which is set with `title`. */
  crumbs?: Crumb[];
  title: string;
  /** Badge next to the title: a course's status, for instance. */
  badge?: ReactNode;
  /** Short facts under the title: identifier, how many lessons… */
  meta?: ReactNode;
  /** What can be done with this, top right. */
  actions?: ReactNode;
  description?: string;
}

/**
 * Header of the panel's four course screens: breadcrumbs, title, short facts
 * and actions.
 *
 * It lives here and not in each page because the course → chapter → lesson
 * trail has four levels: without a breadcrumb on all of them, the only way
 * to go up one step is the browser's back button.
 */
export function StaffEditorHead({ crumbs, title, badge, meta, actions, description }: StaffEditorHeadProps) {
  // Without breadcrumbs it is a top-level screen and its title weighs the same
  // as "Alumnos" or "Profesores"; with breadcrumbs it hangs from something
  // and goes down one step, so the hierarchy is seen without reading the trail.
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
          {/* The current place closes the trail and is not a link: we are already here. */}
          <span className="staff-editor-head__current">{title}</span>
        </nav>
      )}

      <div className="staff-editor-head__bar">
        <div className="staff-editor-head__heading">
          {/* The badge goes on the title row, not below: it is part of how the
              record is named, not one more fact in the list. */}
          <div className="staff-editor-head__title-row">
            <h1 className="staff-editor-head__title">{title}</h1>
            {badge}
          </div>
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
  /** The narrow column: summaries and loose actions, never the main work. */
  aside?: ReactNode;
}

/**
 * Two columns: the work on the left and on the right what is glanced at. The
 * narrow one is in pixels and not in fractions so it does not stretch on wide
 * screens, where a four-figure list at half the screen looks empty.
 */
export function StaffEditorLayout({ children, aside }: StaffEditorLayoutProps) {
  return (
    <div className={`staff-editor${aside ? "" : " staff-editor_layout_single"}`}>
      <div className="staff-editor__main">{children}</div>
      {aside && <aside className="staff-editor__aside">{aside}</aside>}
    </div>
  );
}
