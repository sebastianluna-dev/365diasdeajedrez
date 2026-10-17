import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { LessonPracticeSection } from "@/components/platform/sections/courses/lesson-practice/lesson-practice.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { platformRoutes } from "@/lib/platform-routes";
import { isCourseId } from "@/services/courses/course-rules";
import { getLessonPracticeExercise } from "@/services/exercises/lesson-practice.service";

interface LessonPracticePageProps {
  params: Promise<{ courseRef: string; chapterOrder: string; lessonId: string; n: string }>;
}

/** The segment `[n]`, as the 1-based position it is; anything else is no position. */
function positionOf(n: string): number {
  return /^\d{1,4}$/.test(n) ? Number.parseInt(n, 10) : 0;
}

export async function generateMetadata({ params }: LessonPracticePageProps): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  const { lessonId, n } = await params;
  const item = await getLessonPracticeExercise(lessonId, positionOf(n));
  return item ? { title: `${item.exercise.title} · ${item.lesson.name}` } : {};
}

/**
 * The n-th exercise of a lesson, to solve (D25), outside the lesson's frame:
 * the solve screen is its own page, designed for a phone, and the column of
 * lessons would crowd it. Behind `EXERCISES_ENABLED`; out of range, of an
 * unpublished course, or with no exercise there, it is a 404. The course and
 * the chapter of the URL are checked against the lesson's own and not trusted.
 */
export default async function LessonPracticePage({ params }: LessonPracticePageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const { courseRef, chapterOrder, lessonId, n } = await params;
  if (!isCourseId(courseRef) || !Number.isInteger(Number(chapterOrder))) notFound();
  const item = await getLessonPracticeExercise(lessonId, positionOf(n));
  if (!item) notFound();

  // The lesson is resolved by its id alone: a practice page reached under the
  // wrong course or chapter is sent to the lesson's own address.
  if (item.lesson.href !== platformRoutes.lessonDetail(courseRef, Number(chapterOrder), lessonId)) {
    redirect(item.lesson.href);
  }

  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <Link href={item.lesson.href} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          {item.lesson.name}
        </Link>
        <h1 className="platform-page__title">{item.exercise.title}</h1>
      </header>
      <LessonPracticeSection item={item} />
    </div>
  );
}
