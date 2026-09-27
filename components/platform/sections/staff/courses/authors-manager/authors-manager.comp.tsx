"use client";

import { useRef, useState } from "react";
import { CloseIcon } from "@/components/icons/close-icon.comp";
import { createAuthor, updateAuthor } from "@/services/staff-courses/staff-courses.actions";
import type { AuthorAdminRow } from "@/services/staff-courses/staff-courses.types";
import "./authors-manager.comp.css";
import { AuthorForm } from "./author-form.comp";

interface AuthorsManagerProps {
  /** Every author, by name. */
  authors: AuthorAdminRow[];
  /** The page this sits on: where a failed save is reported. */
  returnTo: string;
  /** What the button says. «Autores» by default; another word where a heading already says it. */
  label?: string;
}

/** What the dialog shows: the list, or the form of one author (none = a new one). */
type View = { kind: "list" } | { kind: "form"; author?: AuthorAdminRow };

/**
 * «Autores»: the button and the dialog where the authors who sign the
 * courses are created and edited. They have no page of their own: authors
 * only matter next to the courses, so they are managed from the catalog and
 * from a course's «Autores» card.
 *
 * One dialog, two views: the list, and the form of the author chosen in it
 * (or of a new one). Saving closes the dialog, like the other dialogs of the
 * panel, so what the action answers — the refreshed list, or the failure in
 * `?error=` — is seen on the page. Authors are never deleted.
 */
export function AuthorsManager({ authors, returnTo, label = "Autores" }: AuthorsManagerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<View>({ kind: "list" });

  const open = () => {
    // It always opens on the list, whatever was left the last time.
    setView({ kind: "list" });
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  return (
    <div className="authors-manager">
      <button type="button" className="platform-button platform-button_variant_quiet" onClick={open}>
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
              Autores
            </h2>
            <p className="authors-manager__subtitle">Quiénes firman los cursos.</p>
          </div>
          <button type="button" className="authors-manager__close" onClick={close} aria-label="Cerrar">
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
                      <span className="authors-manager__row-text">
                        <span className="authors-manager__row-name">{author.name}</span>
                        <span className="authors-manager__row-meta">
                          {author.courseCount} curso{author.courseCount === 1 ? "" : "s"}
                        </span>
                      </span>
                      <button
                        type="button"
                        className="authors-manager__edit"
                        onClick={() => setView({ kind: "form", author })}
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
                <button type="button" className="platform-button" onClick={() => setView({ kind: "form" })}>
                  Nuevo autor
                </button>
              </div>
            </footer>
          </>
        ) : (
          <AuthorForm
            // Remounted per author: the fields are uncontrolled and would keep
            // what the previous one left.
            key={view.author?.id ?? "new"}
            author={view.author}
            returnTo={returnTo}
            action={view.author ? updateAuthor.bind(null, view.author.id) : createAuthor}
            onBack={() => setView({ kind: "list" })}
            // The browser validates the fields before the submit event fires,
            // so the dialog does not close with a bad form in it.
            onSubmit={close}
          />
        )}
      </dialog>
    </div>
  );
}
