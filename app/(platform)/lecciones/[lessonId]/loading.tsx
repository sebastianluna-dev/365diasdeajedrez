import { LessonSkeleton } from "@/components/platform/sections/courses/lesson-view/lesson-skeleton.comp";
import "./lesson-page.css";

// The lesson does not show the platform's generic loading: what is waited for
// here is a board, and the page is the whole window, so it waits in its own
// shape (`LessonSkeleton`) and nothing moves when the lesson lands.
export default function LessonLoading() {
  return (
    <div className="platform-page lesson-page platform-page_width_full platform-page_height_screen">
      <LessonSkeleton />
    </div>
  );
}
