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
        <li key={chapter.id} className="platform-card chapter-list__item">
          <div className="chapter-list__main">
            <span className="chapter-list__order">{chapter.order}</span>
            <div className="chapter-list__info">
              <Link href={chapter.href} className="chapter-list__name">
                {chapter.name}
              </Link>
              {chapter.description && <p className="chapter-list__description">{chapter.description}</p>}
              <p className="chapter-list__meta">
                {chapter.totalLessons} lecciones
                {chapter.estimatedDuration ? ` · ${chapter.estimatedDuration} min` : ""}
              </p>
            </div>
          </div>
          <div className="chapter-list__progress">
            <ProgressIndicator
              percent={chapter.totalLessons === 0 ? 0 : (chapter.completedLessons / chapter.totalLessons) * 100}
              detail={`${chapter.completedLessons}/${chapter.totalLessons}`}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
