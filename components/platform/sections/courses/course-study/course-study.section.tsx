import Link from "next/link";
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
 * A chapter's figures are of the lessons the student SEES: with only the
 * essential ones asked for, the bar of a chapter is over those, which is the
 * list that opens when it is pressed.
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
                <span className="course-study__eyebrow">
                  Capítulo {chapter.order}
                  {chapter.tag && ` · ${chapter.tag}`}
                </span>
                <span className="course-study__title">{chapter.title}</span>

                {chapter.priorityLessons > 0 && (
                  <span className="course-study__tags">
                    <span className="course-study__tag">
                      {chapter.priorityLessons} {chapter.priorityLessons === 1 ? "imprescindible" : "imprescindibles"}
                    </span>
                  </span>
                )}

                <span className="course-study__progress">
                  <span className="course-study__figures">
                    <span className="course-study__percent">{chapter.percent}%</span>
                    <span className="course-study__ratio">
                      <span className="course-study__ratio-value">
                        {chapter.completedLessons}/{chapter.totalLessons}
                      </span>{" "}
                      {chapter.totalLessons === 1 ? "lección" : "lecciones"}
                    </span>
                  </span>
                  <span className="course-study__track">
                    <span className="course-study__fill" style={{ width: `${chapter.percent}%` }} />
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
