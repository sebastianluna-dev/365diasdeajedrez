import type { ReactNode } from "react";
import "./staff-editor.comp.css";

interface StaffEditorHeadProps {
  title: string;
  /**
   * `root` for a screen of the menu (the catalog), whose title weighs the
   * same as "Alumnos" or "Profesores"; `nested` for what hangs from one (a
   * course, a chapter, a lesson), a step down. The size of the title is what
   * says where one is: there is no trail above it.
   */
  level?: "root" | "nested";
  /** Badge next to the title: a course's status, for instance. */
  badge?: ReactNode;
  /** Short facts under the title: identifier, how many lessons… */
  meta?: ReactNode;
  /** What can be done with this, top right. */
  actions?: ReactNode;
  description?: string;
}

/** Header of the panel's course screens: title, short facts and actions. */
export function StaffEditorHead({ title, level = "nested", badge, meta, actions, description }: StaffEditorHeadProps) {
  return (
    <header className={`staff-editor-head${level === "root" ? " staff-editor-head_level_root" : ""}`}>
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
