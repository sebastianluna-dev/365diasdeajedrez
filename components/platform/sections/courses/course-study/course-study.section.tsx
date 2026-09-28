import Link from "next/link";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import type { CourseDetail } from "@/services/courses/courses.types";
import { CourseStudyFrame } from "./course-study-frame.comp";
import "./course-study.section.css";

interface CourseStudySectionProps {
  course: CourseDetail;
  /** What a setting of the course bounced back with, in `?error=`. */
  errorCode?: string;
}

/**
 * The course to study: its chapters as cards, each with how much of it the
 * student has learned, inside the frame every page of the course shares.
 *
 * A chapter says its progress as a count, and with a check once it is whole:
 * the bar is the course's, which is the one thing measured in percentage.
 *
 * A chapter's count is of the lessons the student SEES: with only the
 * priority ones asked for, it is over those, which is the list that opens
 * when the card is pressed.
 */
export function CourseStudySection({ course, errorCode }: CourseStudySectionProps) {
  return (
    <CourseStudyFrame course={course} returnTo={course.studyHref} errorCode={errorCode}>
      {course.chapters.length === 0 ? (
        <EmptyState
          title="Este curso todavía no tiene capítulos"
          description="Vuelve cuando la academia los publique."
        />
      ) : (
        <ol className="course-study">
          {course.chapters.map((chapter) => (
            <li key={chapter.id} className="course-study__item">
              <Link href={chapter.href} className="course-study__chapter">
                <span className="course-study__title">{chapter.name}</span>

                <span className="course-study__foot">
                  {chapter.isPriority && <span className="course-study__tag">Prioridad</span>}

                  <span className="course-study__progress">
                    {chapter.isCompleted && (
                      <span className="course-study__done" role="img" aria-label="Capítulo completo">
                        <CircleCheckIcon className="course-study__done-icon" />
                      </span>
                    )}
                    <span className="course-study__ratio">
                      <span className="course-study__ratio-value">
                        {chapter.completedLessons}/{chapter.totalLessons}
                      </span>{" "}
                      {chapter.totalLessons === 1 ? "lección" : "lecciones"}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </CourseStudyFrame>
  );
}
