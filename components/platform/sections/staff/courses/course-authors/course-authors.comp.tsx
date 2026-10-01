"use client";

import { useRef, useState, useTransition } from "react";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { suggestAuthors } from "@/services/staff-courses/author-rules";
import { manageCourseAuthors } from "@/services/staff-courses/staff-courses.actions";
import type { AuthorAdminRow, CatalogOption, CourseAuthorRow } from "@/services/staff-courses/staff-courses.types";
import { AuthorAvatar } from "../authors-manager/author-avatar.comp";
import { AuthorsManager } from "../authors-manager/authors-manager.comp";
import { StaffPanel } from "../staff-panel.comp";
import "./course-authors.comp.css";

interface CourseAuthorsProps {
  courseId: string;
  /** Who signs the course, in the order they were added. */
  authors: CourseAuthorRow[];
  /** Every author there is: the ones the search can suggest and the dialog lists. */
  allAuthors: AuthorAdminRow[];
  /** The roles an author can have in a course; the first is the one they are added with. */
  roles: CatalogOption[];
}

/**
 * The «Autores» card of the course editor: who signs the course, each with
 * their role, and a search that suggests as it is typed the authors who are
 * not in the course yet.
 *
 * An author is added with the first role and changes it in their own row: the
 * role under the name is a select drawn as text. There is no order to keep:
 * they are listed as they were added. «Gestionar» opens the dialog where an
 * author is created or edited, for the one the search does not find.
 */
export function CourseAuthors({ courseId, authors, allAuthors, roles }: CourseAuthorsProps) {
  const [query, setQuery] = useState("");
  const [isChangingRole, startRoleChange] = useTransition();
  const firstSuggestion = useRef<HTMLFormElement>(null);

  const inCourse = new Set(authors.map((author) => author.authorId));
  const available = allAuthors.filter((author) => !inCourse.has(author.id));
  const suggestions = suggestAuthors(available, query);
  const isSearching = query.trim() !== "";
  const manage = manageCourseAuthors.bind(null, courseId);
  const defaultRoleCode = roles[0]?.code ?? "";

  const changeRole = (authorId: string, roleCode: string) => {
    const data = new FormData();
    data.set("operation", "role");
    data.set("authorId", authorId);
    data.set("roleCode", roleCode);
    startRoleChange(() => manage(data));
  };

  return (
    <StaffPanel title="Autores" action={<AuthorsManager authors={allAuthors} label="Gestionar" size="compact" />}>
      <div className="course-authors">
        {authors.length > 0 ? (
          <ul className="course-authors__list">
            {authors.map((author) => (
              <li key={author.authorId} className="course-authors__row">
                <AuthorAvatar name={author.authorName} photo={author.authorPhoto} shape="circle" />

                <span className="course-authors__text">
                  <span className="course-authors__name">{author.authorName}</span>
                  <PlatformSelect
                    // Remounted when the saved role changes, so it shows what the server has.
                    key={author.roleCode}
                    className="course-authors__role"
                    size="compact"
                    defaultValue={author.roleCode}
                    onValueChange={(roleCode) => changeRole(author.authorId, roleCode)}
                    options={roles.map((role) => ({ value: role.code, label: role.label }))}
                    disabled={isChangingRole}
                    aria-label={`Rol de ${author.authorName}`}
                  />
                </span>

                <form action={manage} className="course-authors__remove-form">
                  <input type="hidden" name="operation" value="remove" />
                  <input type="hidden" name="authorId" value={author.authorId} />
                  <SubmitButton
                    className="platform-row-action platform-row-action_variant_danger"
                    pendingLabel="Quitando…"
                    aria-label={`Quitar a ${author.authorName}`}
                  >
                    Quitar
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="course-authors__empty">Este curso todavía no tiene autores.</p>
        )}

        <div className="course-authors__search">
          <input
            // `text` and not `search`: the browser's own clear button has no place in the design.
            type="text"
            role="searchbox"
            className="course-authors__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              // Enter adds the first suggestion: the one the eye is already on.
              if (event.key !== "Enter") return;
              event.preventDefault();
              firstSuggestion.current?.requestSubmit();
            }}
            placeholder="Buscar autor para agregar"
            aria-label="Buscar autor para agregar al curso"
            autoComplete="off"
          />

          {suggestions.length > 0 && (
            <ul className="course-authors__suggestions" aria-label="Autores que coinciden">
              {suggestions.map((author, index) => (
                <li key={author.id}>
                  <form
                    ref={index === 0 ? firstSuggestion : undefined}
                    action={manage}
                    // The search is done once one is chosen.
                    onSubmit={() => setQuery("")}
                  >
                    <input type="hidden" name="operation" value="add" />
                    <input type="hidden" name="authorId" value={author.id} />
                    <input type="hidden" name="roleCode" value={defaultRoleCode} />
                    <button
                      type="submit"
                      className={`course-authors__suggestion${index === 0 ? " course-authors__suggestion_state_first" : ""}`}
                    >
                      <AuthorAvatar name={author.name} photo={author.photo} size="small" />
                      <span className="course-authors__suggestion-name">{author.name}</span>
                      <span className="course-authors__suggestion-action">Agregar</span>
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          {isSearching && suggestions.length === 0 && (
            <p className="course-authors__none" role="status">
              {available.length === 0 && allAuthors.length > 0
                ? "Todos los autores están ya en este curso."
                : "Ningún autor coincide. Créalo en «Gestionar»."}
            </p>
          )}
        </div>
      </div>
    </StaffPanel>
  );
}
