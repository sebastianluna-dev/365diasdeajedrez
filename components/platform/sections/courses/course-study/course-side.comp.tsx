import Image from "next/image";
import { PlatformSideNav } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { countLessons } from "@/services/courses/course-rules";
import type { CourseDetail } from "@/services/courses/courses.types";
import "./course-side.comp.css";

interface CourseSideProps {
  course: CourseDetail;
  /** The chapter on screen, on a chapter's page: its link is lit. */
  chapter?: { id: string; name: string; completedLessons: number };
}

/**
 * The side column of a course being studied, in the new design system
 * (2026-10-22, «M4» of the owner's canvas): the course itself at the top —
 * its picture, its name and how far it is —, «Aprender» as the extended FAB,
 * its chapters as the column's links, each with its number (a check once it
 * is learned) and its lessons. On a chapter's page that chapter is lit.
 * What to learn and the course's options moved to its settings panel
 * (`CourseSettings`) on 2026-10-23.
 */
export function CourseSide({ course, chapter }: CourseSideProps) {
  const { progress } = course;
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
    </div>
  );
}
