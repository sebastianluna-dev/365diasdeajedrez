"use client";

import Link from "next/link";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { CONTENT_ROLE } from "@/constants/platform/course-codes.const";
import { createChapter, deleteChapter, reorderChapters } from "@/services/staff-courses/staff-courses.actions";
import type { ChapterAdminRow } from "@/services/staff-courses/staff-courses.types";
import { StaffPanel } from "../staff-panel.comp";
import { useSortableRows } from "../use-sortable-rows.hook";
import "./course-syllabus.comp.css";

interface CourseSyllabusProps {
  courseId: string;
  /** Every chapter, the introduction in front and the closing at the end. */
  chapters: ChapterAdminRow[];
  /** A chapter is only deleted from a draft course, and only without progress from any student. */
  isDraft: boolean;
}

/** "1 lección", "2 lecciones": the plural loses the accent, so it is not the singular plus two letters. */
function countLessons(count: number): string {
  return `${count} ${count === 1 ? "lección" : "lecciones"}`;
}

/** "2 lecciones · 14 min": what a chapter holds, and the minutes when something says them. */
function chapterFacts(chapter: ChapterAdminRow): string {
  const lessons = countLessons(chapter.lessonCount);
  return chapter.durationMin ? `${lessons} · ${chapter.durationMin} min` : lessons;
}

/**
 * «Temario»: the course's chapters as the path the student walks, top to
 * bottom along a rail. The introduction opens it and the closing ends it,
 * each in its fixed place — a dashed slot while it does not exist —; between
 * them, the numbered chapters and the field that adds another one.
 *
 * The numbered node is the handle: a chapter is dragged by it, and with the
 * up and down arrows it moves too, which is the only way to reorder with the
 * keyboard. The order is `useSortableRows`'s, the same the lessons of a
 * chapter use.
 */
export function CourseSyllabus({ courseId, chapters, isDraft }: CourseSyllabusProps) {
  const { rows, dragging, setDragging, move, numbers } = useSortableRows({
    items: chapters,
    isFixed: (chapter) => chapter.roleCode !== undefined,
    onReorder: reorderChapters.bind(null, courseId),
  });
  const create = createChapter.bind(null, courseId);
  const lessonCount = chapters.reduce((total, chapter) => total + chapter.lessonCount, 0);

  const intro = rows.find((chapter) => chapter.roleCode === CONTENT_ROLE.INTRO);
  const closing = rows.find((chapter) => chapter.roleCode === CONTENT_ROLE.CLOSING);

  /** Name, facts and what can be done with a chapter: the same for the numbered ones and the fixed ones. */
  const body = (chapter: ChapterAdminRow) => (
    <>
      <span className="course-syllabus__text">
        <Link href={chapter.href} className="course-syllabus__name">
          {chapter.name}
        </Link>
        <span className="course-syllabus__facts">
          {chapterFacts(chapter)}
          {chapter.isPriority && <span className="course-syllabus__priority"> · Prioridad</span>}
        </span>
      </span>

      <span className="course-syllabus__actions">
        {/* Delete only where the server would allow it: draft course and no
            progress from any student. */}
        {isDraft && chapter.progressCount === 0 && (
          <form action={deleteChapter.bind(null, courseId)}>
            <input type="hidden" name="chapterId" value={chapter.id} />
            <SubmitButton
              className="platform-row-action platform-row-action_variant_danger"
              pendingLabel="Eliminando…"
              aria-label={`Eliminar «${chapter.name}»`}
            >
              Eliminar
            </SubmitButton>
          </form>
        )}
        <Link href={chapter.href} className="platform-row-action" aria-label={`Editar «${chapter.name}»`}>
          Editar
        </Link>
      </span>
    </>
  );

  /** The slot of the introduction or of the closing: the chapter, or the dashed box that creates it. */
  const fixed = (kind: "intro" | "closing", chapter: ChapterAdminRow | undefined) => (
    <li className="course-syllabus__step">
      <span className={`course-syllabus__node course-syllabus__node_kind_${kind}`} aria-hidden="true" />
      {chapter ? (
        body(chapter)
      ) : (
        // Both are optional and there is at most one of each. The database's
        // unique index is what really guarantees it.
        <form action={create} className="course-syllabus__slot">
          <input type="hidden" name="role" value={kind === "intro" ? CONTENT_ROLE.INTRO : CONTENT_ROLE.CLOSING} />
          <input type="hidden" name="name" value={kind === "intro" ? "Introducción" : "Cierre"} />
          <SubmitButton className="course-syllabus__add" pendingLabel="Añadiendo…">
            + Añadir {kind === "intro" ? "introducción" : "cierre"}
          </SubmitButton>
        </form>
      )}
    </li>
  );

  return (
    <StaffPanel
      title="Temario"
      meta={`${chapters.length} capítulo${chapters.length === 1 ? "" : "s"} · ${countLessons(lessonCount)}`}
    >
      <ol className="course-syllabus">
        {fixed("intro", intro)}

        {rows.map((chapter, index) =>
          chapter.roleCode !== undefined ? null : (
            <li
              key={chapter.id}
              className={`course-syllabus__step${dragging === index ? " course-syllabus__step_state_dragging" : ""}`}
              draggable
              onDragStart={() => setDragging(index)}
              onDragEnd={() => setDragging(null)}
              onDragOver={(event) => {
                if (dragging === null || dragging === index) return;
                // Without this the browser does not consider the row a valid drop target.
                event.preventDefault();
              }}
              onDrop={(event) => {
                if (dragging === null) return;
                event.preventDefault();
                move(dragging, index);
                setDragging(null);
              }}
            >
              <button
                type="button"
                className="course-syllabus__node course-syllabus__node_kind_chapter"
                aria-label={`Mover el capítulo «${chapter.name}». Usa las flechas arriba y abajo para cambiarlo de sitio.`}
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    move(index, index - 1);
                  } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    move(index, index + 1);
                  }
                }}
              >
                {numbers.get(chapter.id)}
              </button>
              {body(chapter)}
            </li>
          ),
        )}

        <li className="course-syllabus__step">
          <span className="course-syllabus__node course-syllabus__node_kind_new" aria-hidden="true">
            +
          </span>
          <form action={create} className="course-syllabus__new">
            <input
              type="text"
              name="name"
              maxLength={160}
              required
              className="course-syllabus__new-input"
              placeholder="Nombre del nuevo capítulo…"
              aria-label="Nombre del nuevo capítulo"
              autoComplete="off"
            />
            {/* Out of sight while the field is empty (`:placeholder-shown`): Enter adds too. */}
            <SubmitButton className="course-syllabus__new-submit" pendingLabel="Añadiendo…">
              Añadir
            </SubmitButton>
          </form>
        </li>

        {fixed("closing", closing)}
      </ol>
    </StaffPanel>
  );
}
