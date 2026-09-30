"use client";

import { useCallback, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons/close-icon.comp";
import type { AuthorAdminRow } from "@/services/staff-courses/staff-courses.types";
import { AuthorAvatar } from "./author-avatar.comp";
import { AuthorForm } from "./author-form.comp";
import "./authors-manager.comp.css";

interface AuthorsManagerProps {
  /** Every author, by name. */
  authors: AuthorAdminRow[];
  /** What the button says. «Autores» by default; another word where a heading already says it. */
  label?: string;
  /** The smaller box of a card's header, where it shares the line with the title. */
  size?: "regular" | "compact";
}

/** What the dialog shows: the list, or the form of one author (`authorId` absent = a new one). */
type View = { kind: "list" } | { kind: "form"; authorId?: string };

/**
 * «Autores»: the button and the dialog where the authors who sign the
 * courses are created and edited. They have no page of their own: authors
 * only matter next to the courses, so they are managed from the catalog and
 * from a course's «Autores» card.
 *
 * One dialog, two views: the list — photo or initials, how many courses, the
 * slug — and the form of the author chosen in it, or of a new one. Saving
 * goes back to the list, which comes refreshed; the dialog is closed by its
 * cross or with Escape. Authors are never deleted.
 */
export function AuthorsManager({ authors, label = "Autores", size = "regular" }: AuthorsManagerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<View>({ kind: "list" });
  // Bumped on every opening of the form: it is remounted, so it never opens
  // with what was typed the last time nor with the last outcome.
  const [opening, setOpening] = useState(0);

  const showList = useCallback(() => setView({ kind: "list" }), []);
  const showForm = (authorId?: string) => {
    setOpening((count) => count + 1);
    setView({ kind: "form", authorId });
  };
  const open = () => {
    // It always opens on the list, whatever was left the last time.
    showList();
    dialogRef.current?.showModal();
  };

  // Looked up on every render: after saving, the list brings the new values.
  const editing = view.kind === "form" ? authors.find((author) => author.id === view.authorId) : undefined;
  const title = view.kind === "list" ? "Autores" : view.authorId ? "Editar autor" : "Nuevo autor";

  return (
    <div className="authors-manager">
      <button
        type="button"
        className={`platform-button${size === "compact" ? " platform-button_size_compact" : ""}`}
        onClick={open}
      >
        {label}
      </button>

      {/* Native `<dialog>`: it brings focus trapping, closing with Escape and the
          modal backdrop without writing any of that by hand. */}
      <dialog
        ref={dialogRef}
        className="platform-dialog authors-manager__dialog"
        aria-labelledby="authors-manager-title"
      >
        <header className="authors-manager__head">
          <div className="authors-manager__heading">
            <h2 id="authors-manager-title" className="authors-manager__title">
              {title}
            </h2>
            {view.kind === "list" && <p className="authors-manager__subtitle">Quiénes firman los cursos.</p>}
          </div>
          <button
            type="button"
            className="authors-manager__close"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar"
          >
            <CloseIcon className="authors-manager__close-icon" />
          </button>
        </header>

        {view.kind === "list" ? (
          <>
            <div className="authors-manager__body">
              {authors.length > 0 ? (
                <ul className="authors-manager__list">
                  {authors.map((author) => (
                    <li key={author.id} className="authors-manager__row">
                      <AuthorAvatar name={author.name} photo={author.photo} size="large" />
                      <span className="authors-manager__row-text">
                        <span className="authors-manager__row-name">{author.name}</span>
                        <span className="authors-manager__row-meta">
                          {author.courseCount} curso{author.courseCount === 1 ? "" : "s"} · {author.slug}
                        </span>
                      </span>
                      <button
                        type="button"
                        className="platform-row-action authors-manager__edit"
                        onClick={() => showForm(author.id)}
                        aria-label={`Editar a ${author.name}`}
                      >
                        Editar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="authors-manager__empty">Todavía no hay autores. Crea el primero.</p>
              )}
            </div>

            <footer className="authors-manager__foot">
              <p className="authors-manager__note">Un autor no se borra: se quita de cada curso.</p>
              <div className="authors-manager__actions">
                <button
                  type="button"
                  className="platform-button"
                  onClick={() => showForm()}
                >
                  Nuevo autor
                </button>
              </div>
            </footer>
          </>
        ) : (
          <AuthorForm key={opening} author={editing} authors={authors} onSaved={showList} onCancel={showList} />
        )}
      </dialog>
    </div>
  );
}
