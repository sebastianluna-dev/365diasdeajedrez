import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { createLesson, deleteLesson, reorderLessons } from "@/services/staff-courses/staff-courses.actions";
import type { ChapterAdminDetail, LessonAdminRow } from "@/services/staff-courses/staff-courses.types";
import { StaffPanel } from "./staff-panel.comp";
import { SyllabusList } from "./syllabus-list/syllabus-list.comp";

interface ChapterLessonsSectionProps {
  chapter: ChapterAdminDetail;
}

/** "Con PGN · 3 ejercicios · 12 min": what a lesson holds, and its minutes when it has them. */
function lessonFacts(lesson: LessonAdminRow): string {
  const parts = [
    lesson.hasPgn ? "Con PGN" : "Sin PGN",
    `${lesson.exerciseCount} ejercicio${lesson.exerciseCount === 1 ? "" : "s"}`,
  ];
  if (lesson.durationMin) parts.push(`${lesson.durationMin} min`);
  return parts.join(" · ");
}

/**
 * The chapter's lessons, on a page of their own and at the whole width — the
 * same move the course's «Temario» made, and for the same reason: the list is
 * rows, and rows want width.
 *
 * What is drawn is [`SyllabusList`](./syllabus-list/syllabus-list.comp.tsx),
 * the very list the course's chapters are drawn with, because a chapter's
 * lessons are the same thing one level down.
 */
export function ChapterLessonsSection({ chapter }: ChapterLessonsSectionProps) {
  const isDraft = chapter.courseStatusCode === COURSE_STATUS.DRAFT;
  const withPgn = chapter.lessons.filter((lesson) => lesson.hasPgn).length;

  return (
    <div className="chapter-lessons">
      <StaffPanel title="Lecciones" meta={`${chapter.lessons.length} · ${withPgn} con PGN`}>
        <SyllabusList
          noun="lección"
          items={chapter.lessons.map((lesson) => ({
            id: lesson.id,
            name: lesson.name,
            facts: lessonFacts(lesson),
            href: lesson.href,
            roleCode: lesson.roleCode,
            badge: lesson.isPriority ? "Prioridad" : undefined,
            // Delete only where the server would allow it: draft course and no
            // progress from any student.
            canDelete: isDraft && lesson.progressCount === 0,
          }))}
          onReorder={reorderLessons.bind(null, chapter.courseId, chapter.id)}
          createAction={createLesson.bind(null, chapter.courseId, chapter.id)}
          deleteAction={deleteLesson.bind(null, chapter.courseId, chapter.id)}
          deleteFieldName="lessonId"
          newPlaceholder="Nombre de la nueva lección…"
        />
      </StaffPanel>
    </div>
  );
}
