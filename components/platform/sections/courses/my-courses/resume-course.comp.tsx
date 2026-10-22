import Image from "next/image";
import Link from "next/link";
import { ArrowRotateLeftIcon } from "@/components/icons/arrow-rotate-left-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { MOVE_TRAINER_ENABLED } from "@/constants/platform/features.const";
import { countLessons } from "@/services/courses/course-rules";
import type { MyCourseItem } from "@/services/courses/courses.types";
import { WavyProgress } from "./wavy-progress.comp";
import "./resume-course.comp.css";

interface ResumeCourseProps {
  /** A course begun and not finished, with a lesson to open (`resumeCourseOf`). */
  course: MyCourseItem & { learnHref: string };
}

/**
 * «Sigue donde ibas», at the head of «Mis cursos» (2026-10-22, the new design
 * system): the course to go on with, large — its cover, its name, how far it
 * is gone and the lesson that comes next behind «Continuar». «Repasar» is the
 * Move Trainer's and is drawn only while it is on and something is due.
 */
export function ResumeCourse({ course }: ResumeCourseProps) {
  const { progress } = course;
  const image = course.cover ?? course.thumbnail;
  const review = MOVE_TRAINER_ENABLED && course.reviewCount > 0 ? course.reviewCount : 0;
  const exercises = review === 1 ? "ejercicio" : "ejercicios";

  return (
    <section className="resume-course" aria-labelledby="resume-course-name">
      <div className="resume-course__cover">
        {image && (
          <Image src={image} alt="" fill sizes="(max-width: 767px) 100vw, 280px" className="resume-course__image" />
        )}
      </div>

      <div className="resume-course__body">
        <p className="resume-course__eyebrow">Sigue donde ibas</p>
        <h2 id="resume-course-name" className="resume-course__name">
          <Link href={course.href} className="resume-course__link">
            {course.name}
          </Link>
        </h2>
        <p className="resume-course__figures">
          {progress.completedLessons} de {countLessons(progress.totalLessons)}
          {review > 0 && ` · tienes ${review} ${exercises} para repasar`}
        </p>

        <div className="resume-course__meter">
          <WavyProgress percent={progress.percent} size="lg" />
          <span className="resume-course__percent">{progress.percent} %</span>
        </div>

        <div className="resume-course__actions">
          <Link
            href={course.learnHref}
            className="platform-button platform-button_variant_primary platform-button_size_lg"
          >
            <PlayIcon variant="classic-solid" className="platform-button__icon" />
            Continuar
          </Link>
          {review > 0 && (
            <Link
              href={course.reviewHref}
              className="platform-button platform-button_variant_outlined platform-button_size_lg"
              aria-label={`Repasar ${review} ${exercises}`}
            >
              <ArrowRotateLeftIcon variant="classic-solid" className="platform-button__icon" />
              Repasar {review}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
