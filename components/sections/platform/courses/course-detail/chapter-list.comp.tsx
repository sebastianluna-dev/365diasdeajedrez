import Link from "next/link";
import { ProgressIndicator } from "@/components/common/progress-indicator.comp";
import type { CourseChapterItem } from "@/services/courses/courses.types";
import "./chapter-list.comp.css";

interface ChapterListProps {
  chapters: CourseChapterItem[];
}

export function ChapterList({ chapters }: ChapterListProps) {
  return (
    <ol className="chapter-list">
      {chapters.map((chapter) => (
        <li key={chapter.id} className="chapter-list__row">
          {/* La fila entera es el enlace, no sólo el nombre: es lo que el
              diseño dibuja y evita tener que apuntar a un texto pequeño. */}
          <Link href={chapter.href} className="chapter-list__item">
            <span className="chapter-list__order">{chapter.order}</span>

            <div className="chapter-list__info">
              <span className="chapter-list__name">{chapter.name}</span>
              {chapter.description && <p className="chapter-list__description">{chapter.description}</p>}
              <p className="chapter-list__meta">
                {chapter.totalLessons} {chapter.totalLessons === 1 ? "lección" : "lecciones"}
                {chapter.estimatedDuration ? ` · ${chapter.estimatedDuration} min` : ""}
              </p>
            </div>

            <div className="chapter-list__progress">
              <ProgressIndicator
                layout="stacked"
                percent={chapter.totalLessons === 0 ? 0 : (chapter.completedLessons / chapter.totalLessons) * 100}
                detail={`${chapter.completedLessons}/${chapter.totalLessons}`}
              />
            </div>

            <svg
              className="chapter-list__chevron"
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
      ))}
    </ol>
  );
}
