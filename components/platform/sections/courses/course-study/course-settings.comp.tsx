import Link from "next/link";
import { CircleInfoIcon } from "@/components/icons/circle-info-icon.comp";
import {
  PlatformSettingsGroup,
  PlatformSettingsPanel,
} from "@/components/platform/shared/platform-settings-panel/platform-settings-panel.comp";
import type { CourseDetail } from "@/services/courses/courses.types";
import { CourseSettingsArt } from "./course-settings-art.comp";
import { LearnMode } from "./learn-mode.comp";
import { RemoveCourse } from "./remove-course.comp";
import { ResetProgress } from "./reset-progress.comp";

interface CourseSettingsProps {
  course: CourseDetail;
  /** The chapter on screen, on a chapter's page: the settings come back to it, and its own progress can be erased. */
  chapter?: { id: string; name: string; completedLessons: number };
}

/**
 * «Ajustes del curso» (2026-10-23, after Gmail's «Configuración rápida»): the
 * course's settings panel at the right of the workspace, opened by the gear
 * in the bar. What to learn — every lesson or only the priority ones —, the
 * course's information, and its progress: erasing it (on a chapter's page,
 * the chapter's first: it is the page's own, and the course's is the bigger
 * step) and leaving the course. Each option carries the drawing of what it
 * does (`CourseSettingsArt`). Until then these lived in the side column.
 */
export function CourseSettings({ course, chapter }: CourseSettingsProps) {
  const chapterHref = chapter && course.chapters.find((item) => item.id === chapter.id)?.href;
  const { progress } = course;
  const hasProgress = progress.completedLessons > 0 || course.ctaLabel !== "Empezar";

  return (
    <PlatformSettingsPanel title="Ajustes del curso">
      <PlatformSettingsGroup title="Qué aprender">
        <LearnMode
          courseId={course.id}
          onlyPriority={course.onlyPriorityLessons}
          hiddenLessons={course.hiddenLessons}
          returnTo={chapterHref ?? course.studyHref}
        />
      </PlatformSettingsGroup>

      <PlatformSettingsGroup title="El curso">
        <Link href={course.infoHref} className="platform-settings__option">
          <span className="platform-settings__lead">
            <CircleInfoIcon variant="duotone-light" className="platform-settings__lead-icon" />
          </span>
          <span className="platform-settings__option-text">
            <span className="platform-settings__option-label">Información del curso</span>
            <span className="platform-settings__option-hint">Autores, temas y de dónde vienen sus partidas</span>
          </span>
          <span className="platform-settings__option-art">
            <CourseSettingsArt kind="course-info" />
          </span>
        </Link>
      </PlatformSettingsGroup>

      <PlatformSettingsGroup title="Tu progreso">
        {chapter && chapter.completedLessons > 0 && (
          <ResetProgress
            courseId={course.id}
            chapterId={chapter.id}
            name={chapter.name}
            completedLessons={chapter.completedLessons}
          />
        )}
        {hasProgress && (
          <ResetProgress courseId={course.id} name={course.name} completedLessons={progress.completedLessons} />
        )}
        <RemoveCourse courseId={course.id} courseName={course.name} completedLessons={progress.completedLessons} />
      </PlatformSettingsGroup>
    </PlatformSettingsPanel>
  );
}
