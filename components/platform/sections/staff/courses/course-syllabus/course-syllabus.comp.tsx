import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { createChapter, deleteChapter, reorderChapters } from "@/services/staff-courses/staff-courses.actions";
import type { ChapterAdminRow } from "@/services/staff-courses/staff-courses.types";
import { StaffPanel } from "../staff-panel.comp";
import { SyllabusList } from "../syllabus-list/syllabus-list.comp";

interface CourseSyllabusProps {
  courseId: string;
  /** Every chapter, the introduction in front and the closing at the end. */
  chapters: ChapterAdminRow[];
  /** A chapter is only deleted from a draft course, and only without progress from any student. */
  isDraft: boolean;
  /** What went wrong on the last attempt; the actions of the list come back here. */
  errorCode?: string;
}

/** Why a chapter cannot be deleted; undefined when it can. The server checks the same two things. */
function deleteHint(chapter: ChapterAdminRow, isDraft: boolean): string | undefined {
  if (!isDraft) return "Sólo se elimina un capítulo mientras el curso está en borrador.";
  if (chapter.progressCount > 0) return "Hay alumnos con progreso en este capítulo o en sus lecciones.";
  return undefined;
}

/** "1 lección", "2 lecciones": the plural loses the accent, so it is not the singular plus two letters. */
function countLessons(count: number): string {
  return `${count} ${count === 1 ? "lección" : "lecciones"}`;
}

/**
 * «Temario»: the course's chapters as the path the student walks. The list
 * itself is [`SyllabusList`](../syllabus-list/syllabus-list.comp.tsx), the
 * same one a chapter's lessons are drawn with — they are the same thing one
 * level apart. Here it is only given the chapters and what to do with them.
 */
export function CourseSyllabus({ courseId, chapters, isDraft, errorCode }: CourseSyllabusProps) {
  const lessonCount = chapters.reduce((total, chapter) => total + chapter.lessonCount, 0);
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <>
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <StaffPanel
        title="Temario"
        meta={`${chapters.length} capítulo${chapters.length === 1 ? "" : "s"} · ${countLessons(lessonCount)}`}
      >
        <SyllabusList
          noun="capítulo"
          items={chapters.map((chapter) => ({
            id: chapter.id,
            name: chapter.name,
            facts: countLessons(chapter.lessonCount),
            href: chapter.href,
            roleCode: chapter.roleCode,
            badge: chapter.isPriority ? "Prioridad" : undefined,
            // Delete only where the server would allow it: draft course and no
            // progress from any student. Where it is refused, the menu says why.
            canDelete: isDraft && chapter.progressCount === 0,
            deleteHint: deleteHint(chapter, isDraft),
          }))}
          onReorder={reorderChapters.bind(null, courseId)}
          createAction={createChapter.bind(null, courseId)}
          deleteAction={deleteChapter.bind(null, courseId)}
          deleteFieldName="chapterId"
          newPlaceholder="Nombre del nuevo capítulo…"
        />
      </StaffPanel>
    </>
  );
}
