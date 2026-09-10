import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";

// What the STUDENT can see or touch is only the content of published courses.
// The reads already applied it (`getPublishedCourse`, `getTrainerData`), but the
// progress writes and the trainer accepted bare ids: a POST with the id of a
// draft lesson seeded progress — or returned its exercises — with nothing
// stopping it. A single `where` for the three levels, chained into the query
// instead of "read and then check".

export const publishedCourseWhere = {
  status: { code: COURSE_STATUS.PUBLISHED },
} satisfies Prisma.CourseWhereInput;

export const publishedChapterWhere = {
  course: publishedCourseWhere,
} satisfies Prisma.ChapterWhereInput;

export const publishedLessonWhere = {
  chapter: publishedChapterWhere,
} satisfies Prisma.LessonWhereInput;
