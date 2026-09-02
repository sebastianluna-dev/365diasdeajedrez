import Link from "next/link";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import type { ChapterLessonItem } from "@/services/courses/courses.types";
import "./lesson-list.comp.css";

interface LessonListProps {
  lessons: ChapterLessonItem[];
}

const STATUS_LABELS: Record<string, string> = {
  [PROGRESS_STATUS.NOT_STARTED]: "Sin empezar",
  [PROGRESS_STATUS.IN_PROGRESS]: "En curso",
  [PROGRESS_STATUS.COMPLETED]: "Completada",
};

export function LessonList({ lessons }: LessonListProps) {
  return (
    <ol className="lesson-list">
      {lessons.map((lesson) => {
        const isDone = lesson.statusCode === PROGRESS_STATUS.COMPLETED;

        return (
          <li key={lesson.id} className="lesson-list__row">
            <Link href={lesson.href} className="lesson-list__item">
              <span className={`lesson-list__order${isDone ? " lesson-list__order_state_done" : ""}`}>
                {lesson.order}
              </span>

              <span className="lesson-list__info">
                <span className="lesson-list__title">
                  <span className="lesson-list__name">{lesson.name}</span>
                  {lesson.isPriority && <span className="lesson-list__priority">Clave</span>}
                </span>
                {lesson.description && <span className="lesson-list__description">{lesson.description}</span>}
              </span>

              <span className="lesson-list__meta">
                {lesson.estimatedDuration && (
                  <span className="lesson-list__duration">{lesson.estimatedDuration} min</span>
                )}
                <span className={`lesson-list__status lesson-list__status_code_${lesson.statusCode.toLowerCase()}`}>
                  {STATUS_LABELS[lesson.statusCode] ?? lesson.statusCode}
                </span>
              </span>

              <svg
                className="lesson-list__chevron"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
