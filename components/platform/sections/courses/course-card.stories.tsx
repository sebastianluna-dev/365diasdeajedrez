import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CONTENT_TYPE, DEFAULT_LEVEL } from "@/constants/platform/course-codes.const";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { CourseContentTypeItem, CourseLevelItem, CourseSummary } from "@/services/courses/courses.types";
import { formatEloRange } from "@/services/courses/level-rules";
import { CourseCard } from "./course-card.comp";

/** A level as the mapper hands it over (`mapCourseLevel`): the range worded once. */
function level(
  slug: string,
  name: string,
  description: string,
  eloMin: number,
  eloMax: number | null,
): CourseLevelItem {
  return { slug, name, description, eloRange: formatEloRange({ eloMin, eloMax }), eloMin, eloMax };
}

/** The six levels the platform ships with (`LEVEL_VALUES` in prisma/seed-data.ts), the easiest first. */
const LEVELS: CourseLevelItem[] = [
  level(
    DEFAULT_LEVEL.INITIATION,
    "Iniciación",
    "Reglas, movimiento de las piezas, jaque, mate y principios básicos.",
    0,
    799,
  ),
  level(
    DEFAULT_LEVEL.BEGINNER,
    "Principiante",
    "Tácticas elementales, principios de apertura y finales básicos.",
    800,
    1199,
  ),
  level(
    DEFAULT_LEVEL.INTERMEDIATE,
    "Intermedio",
    "Cálculo, evaluación de posiciones, planificación y estructuras de peones.",
    1200,
    1599,
  ),
  level(
    DEFAULT_LEVEL.ADVANCED,
    "Avanzado",
    "Cálculo complejo, estrategia, repertorio, finales y preparación competitiva.",
    1600,
    1999,
  ),
  level(
    DEFAULT_LEVEL.EXPERT,
    "Experto",
    "Análisis profundo, técnica avanzada y perfeccionamiento del juego competitivo.",
    2000,
    2199,
  ),
  level(
    DEFAULT_LEVEL.MASTER,
    "Maestro",
    "Preparación especializada, decisiones posicionales sutiles, cálculo exigente y análisis de alto nivel.",
    2200,
    null,
  ),
];

/** The levels of the catalog with these slugs, in the catalog's order. */
const levelsOf = (...slugs: string[]) => LEVELS.filter((item) => slugs.includes(item.slug));

/** Two rows of the content types catalog (`CONTENT_TYPE_VALUES` in prisma/seed-data.ts). */
const STRATEGY: CourseContentTypeItem = {
  code: CONTENT_TYPE.STRATEGY,
  label: "Estrategia y juego posicional",
  shortLabel: "Estrategia",
  description:
    "Evaluar posiciones y construir planes: actividad de piezas, casillas débiles, espacio, profilaxis e intercambios.",
};
const PAWN_STRUCTURES: CourseContentTypeItem = {
  code: CONTENT_TYPE.PAWN_STRUCTURES,
  label: "Estructuras de peones",
  shortLabel: "Estructuras",
  description: "Cadenas, peones aislados o colgantes, mayorías, rupturas y los planes asociados a cada estructura.",
};

const COURSE_ID = "10000004";
const COURSE_SLUG = "planes-en-el-medio-juego";

/** An invented course of the catalog, not added yet: 24 lessons, a little over six hours. */
const COURSE: CourseSummary = {
  id: COURSE_ID,
  name: "Planes en el medio juego",
  slug: COURSE_SLUG,
  description:
    "Cómo se convierte una posición en un plan: casillas débiles, columnas abiertas y el momento de cambiar piezas, con partidas clásicas comentadas jugada a jugada.",
  contentTypes: [STRATEGY, PAWN_STRUCTURES],
  levels: levelsOf(DEFAULT_LEVEL.INTERMEDIATE, DEFAULT_LEVEL.ADVANCED),
  authorNames: ["Fernanda Ríos"],
  isAdded: false,
  progress: {
    statusCode: PROGRESS_STATUS.NOT_STARTED,
    completedLessons: 0,
    totalLessons: 24,
    percent: 0,
    completedMinutes: 0,
    totalMinutes: 375,
    minutesPercent: 0,
  },
  isCompleted: false,
  continueHref: platformRoutes.chapterDetail(COURSE_ID, 1),
  ctaLabel: "Empezar",
  href: platformRoutes.courseDetail(COURSE_ID),
  infoHref: platformRoutes.courseInfo(COURSE_SLUG),
};

/** The same course once the student added it, at the progress given. */
function added(completedLessons: number, completedMinutes: number): CourseSummary {
  const { totalLessons, totalMinutes } = COURSE.progress;
  const isCompleted = completedLessons === totalLessons;
  return {
    ...COURSE,
    isAdded: true,
    isCompleted,
    ctaLabel: isCompleted ? "Repasar" : completedLessons > 0 ? "Continuar" : "Empezar",
    progress: {
      statusCode: isCompleted
        ? PROGRESS_STATUS.COMPLETED
        : completedLessons > 0
          ? PROGRESS_STATUS.IN_PROGRESS
          : PROGRESS_STATUS.NOT_STARTED,
      completedLessons,
      totalLessons,
      percent: Math.round((completedLessons / totalLessons) * 100),
      completedMinutes,
      totalMinutes,
      minutesPercent: Math.round((completedMinutes / totalMinutes) * 100),
    },
  };
}

const meta = {
  title: "platform/sections/courses/CourseCard",
  component: CourseCard,
  parameters: {
    nextjs: { navigation: { pathname: platformRoutes.courseCatalog } },
    docs: {
      description: {
        component: `
The card of «Explorar cursos»: what a course is, for whoever is choosing one —
its cover, its name with the dots of its levels, two lines of what it is about,
what it teaches and who signs it. The foot is the student's: a course they
added shows their progress and leads to the course to study; one they have not
shows how long it is and leads to its information page, where it is added. The
whole card is the title's link.

Invented data. The staff's covers are Cloudinary pictures; the story with a
cover stands one of the board's pieces (\`public/pieces\`) in for it.

Source: \`components/platform/sections/courses/course-card.comp.tsx\`.
Reference page: [Components › CourseCard](/components/platform/sections/courses/course-card) in the docs site.
`,
      },
    },
  },
  args: { course: COURSE, levels: LEVELS },
  argTypes: {
    course: {
      control: "object",
      description: "The course as `mapCourseSummary` hands it over, with the student's progress.",
    },
    levels: { control: "object", description: "Every level of the catalog, the easiest first: the dots' scale." },
  },
  // One card of the catalog's grid: two to a row in the page's 960px.
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A course the student has not added: how long it is, and «Ver curso», which leads to its information page. */
export const NotAdded: Story = {};

/** A course under way: the percentage, the lessons done and the bar, and the one filled button, «Continuar». */
export const Underway: Story = { args: { course: added(9, 140) } };

/** Added and not started: the empty track and «Empezar», outlined. */
export const NotStarted: Story = { args: { course: added(0, 0) } };

/** Finished: the bar full and in green, and «Repasar». */
export const Completed: Story = { args: { course: added(24, 375) } };

/** With a cover, cropped to 21:9 in its inset frame; without one the frame stays, in the ink colour. */
export const WithCover: Story = { args: { course: { ...COURSE, cover: "/pieces/w-knight.svg" } } };

/** A course with only a name and lessons: no dots, no description, no facts row, no minutes. */
export const Minimal: Story = {
  args: {
    course: {
      ...COURSE,
      name: "Finales de torres",
      description: undefined,
      contentTypes: [],
      levels: [],
      authorNames: [],
      progress: { ...COURSE.progress, totalLessons: 1, totalMinutes: 0 },
    },
  },
};
