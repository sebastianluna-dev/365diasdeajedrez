import { COURSE_STATUS, type AuthorRoleCode, type CourseStatusCode } from "@/constants/platform/course-codes.const";
import type { BoardOrientationCode } from "@/constants/platform/shared-codes.const";
import type { ExerciseModeCode } from "@/constants/platform/training-codes.const";
import { extractMainline } from "@/lib/chess/mainline";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import { formatEloRange } from "@/services/courses/level-rules";
import { sortByRole } from "@/services/shared/content-order";
import { courseSourceAdminSelect, mapCourseSourceAdmin } from "@/services/staff-sources/staff-sources.mapper";
import { lessonHasContent, lessonPgnOf, lessonPgnSelect } from "@/services/shared/lesson-pgn";
import { isExerciseStale } from "@/services/trainer/trainer.mapper";
import type {
  AuthorAdminRow,
  CatalogOption,
  ChapterAdminDetail,
  ChapterGameDetail,
  ContentTypeOption,
  CourseAdminDetail,
  CourseAdminFilter,
  CourseAdminList,
  CourseGameRow,
  LessonAdminDetail,
  LevelOption,
  TopicOption,
} from "./staff-courses.types";

function isCourseStatusCode(value: string | undefined): value is CourseStatusCode {
  return value !== undefined && (Object.values(COURSE_STATUS) as string[]).includes(value);
}

// The staff's course editor. Unlike `services/courses/` — which always filters
// PUBLISHED because it is the student's view — every status is seen here: the
// draft is precisely what has to be editable.

/**
 * The panel's list, filtered by what was asked for in the URL.
 *
 * The filter is resolved in the QUERY and not in memory: the catalog grows over
 * the years and searching on the client would force bringing it whole to discard
 * almost all of it. That is also why the totals are counted over what is seen —
 * they are the search's footer, not the catalog's.
 *
 * A `status` that is not a catalog code is ignored instead of giving zero
 * results: it comes from the URL and a hand-typed URL should not look like an
 * empty list.
 */
export async function listCoursesAdmin(filter: CourseAdminFilter = {}): Promise<CourseAdminList> {
  await requireStaff();

  const query = filter.query?.trim();
  const status = isCourseStatusCode(filter.status) ? filter.status : undefined;

  const courses = await getPlatformDb().course.findMany({
    where: {
      ...(status ? { status: { code: status } } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { slug: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      cover: true,
      publishedAt: true,
      status: { select: { code: true, label: true } },
      courseContentTypes: {
        select: { contentType: { select: { shortLabel: true } } },
        orderBy: { contentType: { order: "asc" } },
      },
      chapters: { select: { _count: { select: { lessons: true } } } },
    },
    orderBy: [{ status: { order: "asc" } }, { name: "asc" }],
  });

  const rows = courses.map((course) => ({
    id: course.id,
    name: course.name,
    slug: course.slug,
    cover: course.cover ?? undefined,
    statusCode: course.status.code as CourseStatusCode,
    statusLabel: course.status.label,
    contentTypeLabels: course.courseContentTypes.map((row) => row.contentType.shortLabel),
    chapterCount: course.chapters.length,
    lessonCount: course.chapters.reduce((total, chapter) => total + chapter._count.lessons, 0),
    publishedAtLabel: course.publishedAt ? formatSpanishDate(course.publishedAt) : undefined,
    href: staffRoutes.courseDetail(course.id),
  }));

  return {
    courses: rows,
    chapterCount: rows.reduce((total, course) => total + course.chapterCount, 0),
    lessonCount: rows.reduce((total, course) => total + course.lessonCount, 0),
  };
}

/** The chapter's minutes: its own figure, or what its lessons add up to; undefined when nothing says. */
function chapterDuration(chapter: {
  estimatedDuration: number | null;
  lessons: { estimatedDuration: number | null }[];
}): number | undefined {
  const own = chapter.estimatedDuration ?? 0;
  const total = own > 0 ? own : chapter.lessons.reduce((sum, lesson) => sum + (lesson.estimatedDuration ?? 0), 0);
  return total > 0 ? total : undefined;
}

export async function getCourseAdminDetail(courseId: string): Promise<CourseAdminDetail | null> {
  await requireStaff();

  const course = await getPlatformDb().course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      cover: true,
      thumbnail: true,
      status: { select: { code: true, label: true } },
      courseContentTypes: {
        select: { contentType: { select: { code: true } } },
        orderBy: { contentType: { order: "asc" } },
      },
      courseLevels: { select: { level: { select: { slug: true } } }, orderBy: { level: { order: "asc" } } },
      courseAuthors: {
        select: {
          authorId: true,
          order: true,
          author: { select: { name: true, photo: true } },
          role: { select: { code: true, label: true } },
        },
        orderBy: { order: "asc" },
      },
      chapters: {
        select: {
          id: true,
          name: true,
          order: true,
          isPriority: true,
          estimatedDuration: true,
          role: { select: { code: true, label: true } },
          _count: { select: { lessons: true, progresses: true } },
          lessons: { select: { ...lessonPgnSelect, estimatedDuration: true } },
        },
        orderBy: { order: "asc" },
      },
      sources: { select: courseSourceAdminSelect, orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!course) return null;

  // Minimum requirement to publish: at least one chapter with a lesson that has a
  // PGN. Publishing an empty course would show blank lessons.
  const canPublish = course.chapters.some((chapter) => chapter.lessons.some(lessonHasContent));

  return {
    id: course.id,
    name: course.name,
    slug: course.slug,
    description: course.description ?? undefined,
    cover: course.cover ?? undefined,
    thumbnail: course.thumbnail ?? undefined,
    statusCode: course.status.code as CourseStatusCode,
    statusLabel: course.status.label,
    contentTypeCodes: course.courseContentTypes.map((row) => row.contentType.code),
    levelSlugs: course.courseLevels.map((courseLevel) => courseLevel.level.slug),
    authors: course.courseAuthors.map((author) => ({
      authorId: author.authorId,
      authorName: author.author.name,
      authorPhoto: author.author.photo ?? undefined,
      roleCode: author.role.code as AuthorRoleCode,
      roleLabel: author.role.label,
      order: author.order,
    })),
    // The introduction in front and the closing at the end; the rest, in their order.
    chapters: sortByRole(
      course.chapters.map((chapter) => ({
        roleCode: chapter.role?.code,
        roleLabel: chapter.role?.label,
        id: chapter.id,
        name: chapter.name,
        order: chapter.order,
        isPriority: chapter.isPriority,
        lessonCount: chapter._count.lessons,
        durationMin: chapterDuration(chapter),
        progressCount: chapter._count.progresses,
        href: staffRoutes.chapterDetail(course.id, chapter.id),
      })),
    ),
    sources: course.sources.map(mapCourseSourceAdmin),
    canPublish,
  };
}

export async function getChapterAdmin(courseId: string, chapterId: string): Promise<ChapterAdminDetail | null> {
  await requireStaff();

  const chapter = await getPlatformDb().chapter.findFirst({
    where: { id: chapterId, courseId },
    select: {
      id: true,
      courseId: true,
      name: true,
      description: true,
      order: true,
      isPriority: true,
      estimatedDuration: true,
      course: { select: { name: true, status: { select: { code: true } } } },
      lessons: {
        select: {
          id: true,
          name: true,
          order: true,
          isPriority: true,
          role: { select: { code: true, label: true } },
          ...lessonPgnSelect,
          _count: { select: { exercises: true, progresses: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!chapter) return null;

  return {
    id: chapter.id,
    courseId: chapter.courseId,
    courseName: chapter.course.name,
    courseStatusCode: chapter.course.status.code as CourseStatusCode,
    name: chapter.name,
    description: chapter.description ?? undefined,
    order: chapter.order,
    isPriority: chapter.isPriority,
    estimatedDuration: chapter.estimatedDuration ?? undefined,
    lessons: sortByRole(
      chapter.lessons.map((lesson) => ({
        roleCode: lesson.role?.code,
        roleLabel: lesson.role?.label,
        id: lesson.id,
        name: lesson.name,
        order: lesson.order,
        isPriority: lesson.isPriority,
        hasPgn: lessonHasContent(lesson),
        exerciseCount: lesson._count.exercises,
        progressCount: lesson._count.progresses,
        href: staffRoutes.lessonDetail(chapter.courseId, chapter.id, lesson.id),
      })),
    ),
  };
}

/**
 * Games of a collection, to list them or to link them to a lesson.
 *
 * The collections are per CHAPTER. `scope` decides what is asked for: that of a
 * chapter — what one of its lessons can use — or all of the course's, which is
 * the course page's overview.
 *
 * The free text matches against both players, the event, the opening and the
 * name, which is what a game is searched by.
 *
 * `moveCount` comes from counting the PGN's main line. It is done here and not
 * in the database because the PGN is text: it is the price of having a single
 * source of the content, and a collection is dozens of games, not thousands.
 */
/**
 * How many games there are, without bringing them over.
 *
 * The page's tab asks for it, and only needs the number: a course's list is
 * hundreds of rows and each one drags its whole PGN along to count the moves.
 */
export async function countCollectionGames(scope: { courseId: string } | { chapterId: string }): Promise<number> {
  await requireStaff();
  return getPlatformDb().game.count({ where: { database: scope } });
}

export async function listCollectionGames(
  scope: { courseId: string } | { chapterId: string },
  query?: string,
): Promise<CourseGameRow[]> {
  await requireStaff();

  const search = query?.trim();
  const games = await getPlatformDb().game.findMany({
    where: {
      database: scope,
      ...(search
        ? {
            OR: [
              { white: { contains: search, mode: "insensitive" as const } },
              { black: { contains: search, mode: "insensitive" as const } },
              { event: { contains: search, mode: "insensitive" as const } },
              { eco: { contains: search, mode: "insensitive" as const } },
              { title: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      white: true,
      black: true,
      event: true,
      eco: true,
      playedAt: true,
      database: { select: { courseId: true, chapter: { select: { id: true, name: true, order: true } } } },
      // Moves = indexed positions minus the initial one (GamePosition stores one row
      // per ply, 0 included): that way there is no need to read and replay the whole
      // collection's PGN to render a number.
      _count: { select: { lessons: true, positions: true } },
    },
    // In the course view they come out grouped by chapter and in its order; within
    // one, in their own.
    orderBy: [{ database: { chapter: { order: "asc" } } }, { order: "asc" }],
  });

  return games.map((game) => ({
    id: game.id,
    // A game of a course always hangs from a chapter; without one there is no
    // board to take it to, and the row stays without a link.
    href: game.database.chapter
      ? staffRoutes.chapterGame(game.database.courseId ?? "", game.database.chapter.id, game.id)
      : "",
    chapterName: game.database.chapter?.name,
    title: game.title ?? `${game.white} — ${game.black}`,
    detail: [game.event, game.playedAt?.getUTCFullYear(), game.eco].filter(Boolean).join(" · "),
    moveCount: Math.max(0, game._count.positions - 1),
    lessonCount: game._count.lessons,
  }));
}

/** "Fischer — Sherwin": how a game is named when it has no name of its own. */
function pairingOf(game: { white: string; black: string }): string {
  return `${game.white} — ${game.black}`;
}

/**
 * A game of the chapter's collection with everything its screen needs: the
 * PGN and the record to edit, the lessons that show it and the chapter's
 * other games.
 *
 * The three ids come from the URL, so the game is asked for THROUGH them: one
 * of another chapter, of another course or of a student's study answers null
 * like one that does not exist.
 */
export async function getChapterGame(
  courseId: string,
  chapterId: string,
  gameId: string,
): Promise<ChapterGameDetail | null> {
  await requireStaff();

  const db = getPlatformDb();
  const game = await db.game.findFirst({
    where: { id: gameId, database: { chapterId, courseId } },
    select: {
      id: true,
      databaseId: true,
      title: true,
      white: true,
      black: true,
      whiteElo: true,
      blackElo: true,
      whiteTitle: true,
      blackTitle: true,
      whiteCountry: true,
      blackCountry: true,
      playedAt: true,
      event: true,
      site: true,
      round: true,
      eco: true,
      pgn: true,
      result: { select: { code: true, label: true } },
      source: { select: { label: true } },
      lessons: {
        select: { id: true, name: true, orientation: { select: { code: true } } },
        orderBy: { order: "asc" },
      },
      database: {
        select: {
          chapter: { select: { name: true, order: true, course: { select: { name: true } } } },
        },
      },
    },
  });
  if (!game?.database.chapter) return null;
  const { chapter } = game.database;

  // The staff edits what the student reads, so it is set the way the student
  // sees it: from the side of the first lesson that says one.
  const orientations: Record<string, "white" | "black"> = { WHITE: "white", BLACK: "black" };
  const orientation = game.lessons.map((lesson) => orientations[lesson.orientation.code]).find(Boolean);

  const siblings = await db.game.findMany({
    where: { databaseId: game.databaseId },
    select: { id: true, title: true, white: true, black: true, result: { select: { label: true } } },
    orderBy: { order: "asc" },
  });

  return {
    id: game.id,
    courseId,
    courseName: chapter.course.name,
    chapterId,
    chapterName: chapter.name,
    chapterOrder: chapter.order,
    title: game.title ?? undefined,
    white: game.white,
    black: game.black,
    whiteElo: game.whiteElo ?? undefined,
    blackElo: game.blackElo ?? undefined,
    whiteTitle: game.whiteTitle ?? undefined,
    blackTitle: game.blackTitle ?? undefined,
    whiteCountry: game.whiteCountry ?? undefined,
    blackCountry: game.blackCountry ?? undefined,
    resultCode: game.result.code,
    resultLabel: game.result.label,
    playedAtValue: game.playedAt ? game.playedAt.toISOString().slice(0, 10) : undefined,
    playedAtLabel: game.playedAt ? formatSpanishDate(game.playedAt) : undefined,
    event: game.event ?? undefined,
    site: game.site ?? undefined,
    round: game.round ?? undefined,
    eco: game.eco ?? undefined,
    sourceLabel: game.source.label,
    pgn: game.pgn,
    orientation,
    lessons: game.lessons.map((lesson) => ({
      id: lesson.id,
      name: lesson.name,
      href: staffRoutes.lessonDetail(courseId, chapterId, lesson.id),
    })),
    siblings: siblings.map((sibling) => ({
      id: sibling.id,
      label: sibling.title ?? pairingOf(sibling),
      players: sibling.title ? pairingOf(sibling) : undefined,
      resultLabel: sibling.result.label,
      href: staffRoutes.chapterGame(courseId, chapterId, sibling.id),
    })),
  };
}

/** Results from the catalog, for the record's form. The label IS the PGN token ("1-0", "*"…). */
export async function listGameResults(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().gameResult.findMany({ orderBy: { order: "asc" }, select: { code: true, label: true } });
}

export async function getLessonAdmin(chapterId: string, lessonId: string): Promise<LessonAdminDetail | null> {
  await requireStaff();

  const lesson = await getPlatformDb().lesson.findFirst({
    where: { id: lessonId, chapterId },
    select: {
      id: true,
      chapterId: true,
      name: true,
      description: true,
      order: true,
      isPriority: true,
      isTrainable: true,
      trainingColor: { select: { code: true } },
      estimatedDuration: true,
      pgn: true,
      game: {
        select: { id: true, title: true, white: true, black: true, event: true, eco: true, playedAt: true, pgn: true },
      },
      gameId: true,
      pgnUpdatedAt: true,
      orientation: { select: { code: true } },
      chapter: {
        select: {
          name: true,
          courseId: true,
          course: { select: { name: true, status: { select: { code: true } } } },
        },
      },
      _count: { select: { progresses: true } },
      lessonTopics: { select: { topicId: true } },
      exercises: {
        select: {
          id: true,
          order: true,
          promptText: true,
          line: true,
          startPly: true,
          endPly: true,
          frozenAt: true,
          mode: { select: { code: true, label: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!lesson) return null;

  return {
    id: lesson.id,
    chapterId: lesson.chapterId,
    chapterName: lesson.chapter.name,
    courseId: lesson.chapter.courseId,
    courseName: lesson.chapter.course.name,
    name: lesson.name,
    description: lesson.description ?? undefined,
    order: lesson.order,
    isPriority: lesson.isPriority,
    isTrainable: lesson.isTrainable,
    trainingColorCode: lesson.trainingColor?.code,
    estimatedDuration: lesson.estimatedDuration ?? undefined,
    orientationCode: lesson.orientation.code as BoardOrientationCode,
    canDelete: lesson.chapter.course.status.code === COURSE_STATUS.DRAFT && lesson._count.progresses === 0,
    pgn: lessonPgnOf(lesson),
    game: lesson.game
      ? {
          id: lesson.game.id,
          href: staffRoutes.chapterGame(lesson.chapter.courseId, lesson.chapterId, lesson.game.id),
          title: lesson.game.title ?? `${lesson.game.white} — ${lesson.game.black}`,
          detail: [lesson.game.event, lesson.game.playedAt?.getUTCFullYear(), lesson.game.eco]
            .filter(Boolean)
            .join(" · "),
          moveCount: extractMainline(lesson.game.pgn)?.sans.length ?? 0,
          lessonCount: 0,
        }
      : undefined,
    pgnUpdatedAtLabel: lesson.pgnUpdatedAt ? formatSpanishDate(lesson.pgnUpdatedAt) : undefined,
    topicIds: lesson.lessonTopics.map((lessonTopic) => lessonTopic.topicId),
    exercises: lesson.exercises.map((exercise) => ({
      id: exercise.id,
      order: exercise.order,
      modeCode: exercise.mode.code as ExerciseModeCode,
      modeLabel: exercise.mode.label,
      promptText: exercise.promptText ?? undefined,
      line: exercise.line,
      startPly: exercise.startPly,
      endPly: exercise.endPly,
      // Same criterion as the student's trainer: a single definition of "stale".
      isStale: isExerciseStale(exercise.frozenAt, lesson.pgnUpdatedAt),
    })),
  };
}

export async function listAuthors(): Promise<AuthorAdminRow[]> {
  await requireStaff();

  const authors = await getPlatformDb().author.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
      photo: true,
      _count: { select: { courseAuthors: true } },
    },
    orderBy: { name: "asc" },
  });

  return authors.map((author) => ({
    id: author.id,
    name: author.name,
    slug: author.slug,
    bio: author.bio ?? undefined,
    photo: author.photo ?? undefined,
    courseCount: author._count.courseAuthors,
  }));
}

// Catalogs: they are READ to populate selectors, never edited from the interface
// (their codes are stable and the logic compares them by code).

export async function listContentTypes(): Promise<ContentTypeOption[]> {
  await requireStaff();
  return getPlatformDb().contentType.findMany({
    where: { isActive: true },
    select: { code: true, label: true, shortLabel: true, description: true },
    orderBy: { order: "asc" },
  });
}

/** The levels a course can be aimed at, the easiest first. They go by slug, not by code. */
export async function listLevels(): Promise<LevelOption[]> {
  await requireStaff();
  const levels = await getPlatformDb().level.findMany({
    where: { isActive: true },
    select: { slug: true, name: true, eloMin: true, eloMax: true },
    orderBy: [{ order: "asc" }, { eloMin: "asc" }],
  });
  return levels.map((level) => ({ slug: level.slug, name: level.name, eloRange: formatEloRange(level) }));
}

export async function listCourseStatuses(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().courseStatus.findMany({ select: { code: true, label: true }, orderBy: { order: "asc" } });
}

export async function listTopics(): Promise<TopicOption[]> {
  await requireStaff();
  return getPlatformDb().topic.findMany({ select: { id: true, code: true, label: true }, orderBy: { order: "asc" } });
}

export async function listExerciseModes(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().exerciseMode.findMany({ select: { code: true, label: true }, orderBy: { order: "asc" } });
}

export async function listAuthorRoles(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().authorRole.findMany({ select: { code: true, label: true }, orderBy: { order: "asc" } });
}
