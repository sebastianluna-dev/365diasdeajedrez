import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ClassPracticeSection } from "@/components/platform/sections/classes/class-practice/class-practice.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getClassBlockExercise } from "@/services/exercises/class-practice.service";

interface ClassExercisePageProps {
  params: Promise<{ classId: string; blockId: string; n: string }>;
}

/** The segment `[n]`, as the 1-based position it is; anything else is no position. */
function positionOf(n: string): number {
  return /^\d{1,4}$/.test(n) ? Number.parseInt(n, 10) : 0;
}

export async function generateMetadata({ params }: ClassExercisePageProps): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  const { classId, blockId, n } = await params;
  const item = await getClassBlockExercise(classId, blockId, positionOf(n));
  return item ? { title: `${item.exercise.title} · ${item.classBlock.classTitle}` } : {};
}

/**
 * The n-th exercise of a class's EXERCISE block, to solve (D29): under the
 * class's address, back to the class at the end. Behind `EXERCISES_ENABLED`;
 * out of range, of a block the student may not see now (an AFTER block before
 * the class ends, a class they hold no seat in, a seat moved to another
 * date), it is a 404. The student is the DAL's, through the viewer.
 */
export default async function ClassExercisePage({ params }: ClassExercisePageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const { classId, blockId, n } = await params;
  const item = await getClassBlockExercise(classId, blockId, positionOf(n));
  if (!item) notFound();

  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head platform-page__head_kind_solve">
        <Link href={item.classBlock.href} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          {item.classBlock.classTitle}
        </Link>
        <h1 className="platform-page__title">{item.exercise.title}</h1>
      </header>
      <ClassPracticeSection item={item} />
    </div>
  );
}
