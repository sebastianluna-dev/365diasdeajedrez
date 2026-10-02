import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { MyCourseItem } from "@/services/courses/courses.types";
import { MyCourseCard } from "./my-course-card.comp";

const COURSE_ID = "10000007";

/** Lessons and minutes of the invented course below. */
const TOTAL_LESSONS = 61;
const TOTAL_MINUTES = 1220;

/**
 * An invented course of the student's, at the progress given. The square is
 * one of the board's pieces from `public/pieces`, standing in for the staff's
 * Cloudinary picture.
 */
function course(completedLessons: number, completedMinutes: number): MyCourseItem {
  const isCompleted = completedLessons === TOTAL_LESSONS;
  return {
    id: COURSE_ID,
    name: "Las partidas inmortales del siglo XIX",
    slug: "las-partidas-inmortales-del-siglo-xix",
    thumbnail: "/pieces/w-knight.svg",
    contentTypes: [],
    levels: [],
    authorNames: ["Mateo Vidal"],
    isAdded: true,
    progress: {
      statusCode: isCompleted
        ? PROGRESS_STATUS.COMPLETED
        : completedLessons > 0
          ? PROGRESS_STATUS.IN_PROGRESS
          : PROGRESS_STATUS.NOT_STARTED,
      completedLessons,
      totalLessons: TOTAL_LESSONS,
      percent: Math.round((completedLessons / TOTAL_LESSONS) * 100),
      completedMinutes,
      totalMinutes: TOTAL_MINUTES,
      minutesPercent: Math.round((completedMinutes / TOTAL_MINUTES) * 100),
    },
    isCompleted,
    continueHref: platformRoutes.chapterDetail(COURSE_ID, 1),
    ctaLabel: isCompleted ? "Repasar" : completedLessons > 0 ? "Continuar" : "Empezar",
    href: platformRoutes.courseDetail(COURSE_ID),
    infoHref: platformRoutes.courseInfo("las-partidas-inmortales-del-siglo-xix"),
    learnHref: platformRoutes.chapterDetail(COURSE_ID, 1),
    reviewCount: completedLessons > 0 ? 12 : 0,
    reviewHref: platformRoutes.courseReview(COURSE_ID),
  };
}

const UNDERWAY = course(36, 720);
const JUST_ADDED = course(0, 0);

const meta = {
  title: "platform/sections/courses/my-courses/MyCourseCard",
  component: MyCourseCard,
  parameters: {
    nextjs: { navigation: { pathname: platformRoutes.courses } },
    docs: {
      description: {
        component: `
A course of the student's as a row of «Mis cursos»: its square picture, its
name, how far they are in it — the two counts as one line of text and the
percentage on a ring — and «Aprender». Nothing of what the course is: that is
the catalog's card. The card is not a link; the picture and the name lead to
the course, and the button where it says.

«Repasar» belongs to the Move Trainer, which is switched off
(\`MOVE_TRAINER_ENABLED\`), so no story draws it. Invented data.

Source: \`components/platform/sections/courses/my-courses/my-course-card.comp.tsx\`.
Reference page: [Components › MyCourseCard](/components/platform/sections/courses/my-courses/my-course-card) in the docs site.
`,
      },
    },
  },
  args: { course: UNDERWAY },
  argTypes: {
    course: {
      control: "object",
      description: "The course as `mapMyCourse` hands it over: the summary, `learnHref`, `reviewCount`, `reviewHref`.",
    },
  },
  // The list of «Mis cursos», beside the streak's column: one course to a row.
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MyCourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A course under way: «36 de 61 lecciones · 720/1220 minutos», and 59% on the ring. */
export const Underway: Story = {};

/** Just added: nothing done, so the ring is its track alone, at 0%. */
export const NotStarted: Story = { args: { course: JUST_ADDED } };

/** Finished: the ring whole and no other mark; «Aprender» still leads, to start it over. */
export const Finished: Story = { args: { course: course(TOTAL_LESSONS, TOTAL_MINUTES) } };

/** A course whose lessons say no minutes: the lessons alone. */
export const WithoutMinutes: Story = {
  args: { course: { ...UNDERWAY, progress: { ...UNDERWAY.progress, totalMinutes: 0, completedMinutes: 0 } } },
};

/** No lesson in view: «Aprender» keeps its place, switched off, so the rows of the list line up. */
export const WithoutLessons: Story = {
  args: {
    course: {
      ...JUST_ADDED,
      learnHref: undefined,
      progress: { ...JUST_ADDED.progress, totalLessons: 0, totalMinutes: 0 },
    },
  },
};

/** Without a picture: the square stays, in the ink colour, and still leads to the course. */
export const WithoutPicture: Story = { args: { course: { ...UNDERWAY, thumbnail: undefined } } };
