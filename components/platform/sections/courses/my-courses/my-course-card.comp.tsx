import Image from "next/image";
import Link from "next/link";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { MOVE_TRAINER_ENABLED } from "@/constants/platform/features.const";
import { countLessons } from "@/services/courses/course-rules";
import type { MyCourseItem } from "@/services/courses/courses.types";
import "./my-course-card.comp.css";

interface MyCourseCardProps {
  course: MyCourseItem;
}

/** Two columns beside the streak in the wide page: a card is about 440px; one on a phone. */
const COVER_SIZES = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 440px";

/**
 * A course of the student's as a cover (2026-10-07, «M2a», the owner's choice
 * among two rounds of variants): its cover across the top, so a course is
 * recognised as it is in the catalog; under it the name, a bar of how far
 * they are, and at the foot the figures and the button that goes on.
 *
 * It replaced a row with a square picture and a ring of progress. A finished
 * course says so — the bar in the success green and «Completado» where the
 * button was — and leads to its page like any other.
 *
 * The whole card leads to the course, through its name: the link's `::after`
 * covers the card, so there is one link to announce. The button, raised above
 * it, leads elsewhere — to the lesson that comes next (`learnHref`) —, and a
 * course without lessons in view has none.
 *
 * «Repasar» is the Move Trainer's: while that is off (`MOVE_TRAINER_ENABLED`)
 * it is not drawn; on, it goes before the button when something is due.
 */
export function MyCourseCard({ course }: MyCourseCardProps) {
  const { progress } = course;
  const image = course.cover ?? course.thumbnail;

  return (
    <article className={`my-course-card${course.isCompleted ? " my-course-card_state_done" : ""}`}>
      <div className="my-course-card__cover">
        {image && <Image src={image} alt="" fill sizes={COVER_SIZES} className="my-course-card__cover-image" />}
      </div>

      <div className="my-course-card__body">
        <h2 className="my-course-card__name">
          <Link href={course.href} className="my-course-card__link">
            {course.name}
          </Link>
        </h2>

        <span className="my-course-card__meter" aria-hidden="true">
          <span className="my-course-card__meter-fill" style={{ width: `${progress.percent}%` }} />
        </span>

        <div className="my-course-card__foot">
          <p className="my-course-card__figures">
            {progress.totalLessons === 0
              ? "Sin lecciones todavía"
              : course.isCompleted
                ? `${progress.completedLessons} de ${countLessons(progress.totalLessons)}`
                : `${progress.percent}% · ${progress.completedLessons} de ${countLessons(progress.totalLessons)}`}
          </p>

          <div className="my-course-card__actions">
            {MOVE_TRAINER_ENABLED && course.reviewCount > 0 && (
              <Link
                href={course.reviewHref}
                className="platform-button platform-button_variant_ink platform-button_size_sm"
                aria-label={`Repasar ${course.reviewCount} ${course.reviewCount === 1 ? "ejercicio" : "ejercicios"}`}
              >
                Repasar {course.reviewCount}
              </Link>
            )}

            {course.isCompleted ? (
              <span className="my-course-card__done">
                <CircleCheckIcon variant="classic-solid" className="my-course-card__done-icon" />
                Completado
              </span>
            ) : (
              course.learnHref && (
                <Link
                  href={course.learnHref}
                  className="platform-button platform-button_variant_soft platform-button_size_sm"
                >
                  {progress.completedLessons === 0 ? "Empezar" : "Continuar"}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
