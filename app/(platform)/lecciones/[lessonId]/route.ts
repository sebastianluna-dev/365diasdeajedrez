import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getLessonView } from "@/services/courses/courses.service";

/**
 * Where the lessons used to live. They now hang from their chapter
 * (`/cursos/<curso>/<capítulo>/<lección>`), so that the column of lessons can
 * live in a layout and not be fetched again on every move.
 *
 * This stays because those URLs were shared and bookmarked, and a lesson's id
 * is what a teacher pastes into a class. A route handler and not a page: it
 * answers 308 before anything is rendered, whereas a page that redirects has
 * already sent its segment's fallback and leaves the move to the browser.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = await getLessonView(lessonId);
  if (!lesson) return new NextResponse("No such lesson", { status: 404 });

  return NextResponse.redirect(new URL(lesson.href, request.url), 308);
}
