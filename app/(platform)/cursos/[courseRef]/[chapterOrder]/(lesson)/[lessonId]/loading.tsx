import { LessonSkeleton } from "@/components/platform/sections/courses/lesson-view/lesson-skeleton.comp";

/**
 * The boundary sits on the LESSON's segment and not on the chapter's: what is
 * waited for here is the PGN, and the column beside it is the layout's and
 * does not move.
 */
export default function LessonLoading() {
  return <LessonSkeleton />;
}
