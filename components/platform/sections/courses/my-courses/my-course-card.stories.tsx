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
    isReviewUpToDate: false,
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
A course of the student's as a card of «Mis cursos», in the new design system
(Material 3): its cover across the top, its name with the percentage and the
lessons, a wave of how far they are, and at the foot the text button
«Continuar» (or «Empezar»); finished, a straight green line and «Completado»
where the button was. Nothing of what the course is: that is the catalog's
card. The whole card leads to the course through its name; the button, to the
lesson that comes next.

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
      description:
        "The course as `mapMyCourse` hands it over: the summary, `learnHref`, `reviewCount`, `isReviewUpToDate`, `reviewHref`.",
    },
  },
  // A cell of «Mis cursos»: four cards to a row of the panel.
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MyCourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A course under way: the wave at 59 %, «59 % · 36 de 61 lecciones» and «Continuar». */
export const Underway: Story = {};

/** Just added: nothing done, the track alone, and «Empezar». */
export const NotStarted: Story = { args: { course: JUST_ADDED } };

/** Finished: the line whole, straight and green, and «Completado» where the button was. */
export const Finished: Story = { args: { course: course(TOTAL_LESSONS, TOTAL_MINUTES) } };

/** A course whose lessons say no minutes: the card counts lessons, as always. */
export const WithoutMinutes: Story = {
  args: { course: { ...UNDERWAY, progress: { ...UNDERWAY.progress, totalMinutes: 0, completedMinutes: 0 } } },
};

/** No lesson in view: «Sin lecciones todavía», and no button, since there is nothing to go on to. */
export const WithoutLessons: Story = {
  args: {
    course: {
      ...JUST_ADDED,
      learnHref: undefined,
      progress: { ...JUST_ADDED.progress, totalLessons: 0, totalMinutes: 0 },
    },
  },
};

/** Without a picture: the frame stays, in the container's grey, and still leads to the course. */
export const WithoutPicture: Story = { args: { course: { ...UNDERWAY, cover: undefined, thumbnail: undefined } } };
