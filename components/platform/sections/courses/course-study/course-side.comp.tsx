import Image from "next/image";
import Link from "next/link";
import { CircleInfoIcon } from "@/components/icons/circle-info-icon.comp";
import { PlatformSideNav } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { countLessons } from "@/services/courses/course-rules";
import type { CourseDetail } from "@/services/courses/courses.types";
import { LearnMode } from "./learn-mode.comp";
import { RemoveCourse } from "./remove-course.comp";
import { ResetProgress } from "./reset-progress.comp";
import "./course-side.comp.css";

interface CourseSideProps {
  course: CourseDetail;
  /**
   * The chapter on screen, on a chapter's page: its link is lit, the
   * settings come back to it, and its own progress can be erased.
   */
  chapter?: { id: string; name: string; completedLessons: number };
}

/**
 * The side column of a course being studied, in the new design system
 * (2026-10-22, «M4» of the owner's canvas): the course itself at the top —
 * its picture, its name and how far it is —, «Aprender» as the extended FAB,
 * its chapters as the column's links, each with its number (a check once it
 * is learned) and its lessons, then what to learn — every lesson or only the
 * priority ones — and the course's options: its information, erasing the
 * progress (on a chapter's page, the chapter's first: it is the page's own,
 * and the course's is the bigger step), and leaving it. On a chapter's page
 * that chapter is lit.
 */
export function CourseSide({ course, chapter }: CourseSideProps) {
  const chapterHref = chapter && course.chapters.find((item) => item.id === chapter.id)?.href;
  const { progress } = course;
  const hasProgress = progress.completedLessons > 0 || course.ctaLabel !== "Empezar";
  const image = course.thumbnail ?? course.cover;

  return (
    <div className="course-side">
      <div className="course-side__course">
        <span className="course-side__thumb">
          {image && <Image src={image} alt="" fill sizes="40px" className="course-side__thumb-image" />}
        </span>
        <span className="course-side__about">
          <span className="course-side__name">{course.name}</span>
          <span className="course-side__figures">
            {progress.totalLessons === 0
              ? "Sin lecciones todavía"
              : `${progress.percent} % · ${progress.completedLessons} de ${countLessons(progress.totalLessons)}`}
          </span>
        </span>
      </div>

      <PlatformSideNav
        label="El curso"
        action={course.learnHref ? { label: "Aprender", href: course.learnHref } : undefined}
        groups={
          course.chapters.length === 0
            ? []
            : [
                {
                  title: "Capítulos",
                  links: course.chapters.map((item) => ({
                    label: item.name,
                    href: item.href,
                    count: `${item.completedLessons}/${item.totalLessons}`,
                    badge: { text: String(item.order), done: item.isCompleted },
                    current: item.id === chapter?.id,
                  })),
                },
              ]
        }
      />

      <LearnMode
        courseId={course.id}
        onlyPriority={course.onlyPriorityLessons}
        hiddenLessons={course.hiddenLessons}
        returnTo={chapterHref ?? course.studyHref}
      />

      <section className="course-side__group" aria-labelledby="course-side-options">
        <h2 id="course-side-options" className="course-side__title">
          Opciones
        </h2>
        <Link href={course.infoHref} className="course-side__link">
          <CircleInfoIcon variant="duotone-light" className="course-side__icon" />
          Información del curso
        </Link>
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
      </section>
    </div>
  );
}
