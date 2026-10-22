import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { MOVE_TRAINER_ENABLED } from "@/constants/platform/features.const";
import { mdButton, mdCard } from "@/lib/material/material-classes";
import { countLessons } from "@/services/courses/course-rules";
import type { MyCourseItem } from "@/services/courses/courses.types";
import { WavyProgress } from "./wavy-progress.comp";
import "./my-course-card.comp.css";

interface MyCourseCardProps {
  course: MyCourseItem;
}

/** Four to a row in the panel: a card is about 240px; two on a tablet, one on a phone. */
const COVER_SIZES = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 280px";

/**
 * A course of the student's as Material's outlined card (`mdCard`,
 * 2026-10-22, the new design system; before it, «M2a» of 2026-10-07): its cover across the top,
 * so a course is recognised as it is in the catalog; under it the name, the
 * figures, a wave of how far they are, and at the foot the text button that
 * goes on (Material's text button).
 *
 * A finished course says so — the line straight and in the success green,
 * and «Completado» where the button was — and leads to its page like any
 * other.
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
    <article
      className={`${mdCard("outlined")} my-course-card${course.isCompleted ? " my-course-card_state_done" : ""}`}
    >
      <div className="my-course-card__cover">
        {image && <Image src={image} alt="" fill sizes={COVER_SIZES} className="my-course-card__cover-image" />}
      </div>

      <div className="my-course-card__body">
        <div>
          <h2 className="my-course-card__name">
            <Link href={course.href} className="my-course-card__link">
              {course.name}
            </Link>
          </h2>
          <p className="my-course-card__figures">
            {progress.totalLessons === 0
              ? "Sin lecciones todavía"
              : course.isCompleted
                ? `Completado · ${progress.completedLessons} de ${countLessons(progress.totalLessons)}`
                : `${progress.percent} % · ${progress.completedLessons} de ${countLessons(progress.totalLessons)}`}
          </p>
        </div>

        <WavyProgress percent={progress.percent} isDone={course.isCompleted} />

        <div className="my-course-card__actions">
          {MOVE_TRAINER_ENABLED && course.reviewCount > 0 && (
            <Link
              href={course.reviewHref}
              className={mdButton("text", "sm")}
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
              <Link href={course.learnHref} className={mdButton("text", "sm")}>
                {progress.completedLessons === 0 ? "Empezar" : "Continuar"}
                <ChevronRightIcon variant="classic-solid" className="platform-md-icon" />
              </Link>
            )
          )}
        </div>
      </div>
    </article>
  );
}
