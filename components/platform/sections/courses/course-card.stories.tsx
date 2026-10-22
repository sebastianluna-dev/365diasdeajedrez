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

const meta = {
  title: "platform/sections/courses/CourseCard",
  component: CourseCard,
  parameters: {
    nextjs: { navigation: { pathname: platformRoutes.courseCatalog } },
    docs: {
      description: {
        component: `
The card of the catalog, as Material's outlined card: its cover, its name,
who it is for and what it teaches in one line, and at the foot what can be
done — «Lo llevas» and «Continuar» once added, its length and «Agregar»
before. No description and no progress: those are the course's page and
«Mis cursos». The whole card is the title's link: to the course once added,
to its information page before.

Invented data. The staff's covers are Cloudinary pictures; the story with a
cover stands one of the board's pieces (\`public/pieces\`) in for it.

Source: \`components/platform/sections/courses/course-card.comp.tsx\`.
Reference page: [Components › CourseCard](/components/platform/sections/courses/course-card) in the docs site.
`,
      },
    },
  },
  args: { course: COURSE, addAction: async () => {} },
  argTypes: {
    course: { control: "object", description: "The course as `mapCourseSummary` hands it over." },
    addAction: { control: false, description: "`addCourse` bound to the course: «Agregar»." },
  },
  // One card of the catalog's grid: four to a row of the panel.
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Not added: two levels and two topics, its length and «Agregar»; without a cover the frame stays, in the container's grey. */
export const Default: Story = {};

/** With a cover, cropped to 21:9. */
export const WithCover: Story = { args: { course: { ...COURSE, cover: "/pieces/w-knight.svg" } } };

/** One level and many topics: the line wraps. */
export const ManyTopics: Story = {
  args: {
    course: {
      ...COURSE,
      levels: levelsOf(DEFAULT_LEVEL.BEGINNER),
      contentTypes: [
        STRATEGY,
        PAWN_STRUCTURES,
        { ...STRATEGY, code: "ENDGAMES", label: "Finales", shortLabel: "Finales" },
      ],
    },
  },
};

/** A course with only a name and lessons: no line about it and no minutes. */
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

/** Already the student's: «Lo llevas» and the button that goes on. */
export const Added: Story = {
  args: { course: { ...COURSE, cover: "/pieces/w-knight.svg", isAdded: true, ctaLabel: "Continuar" } },
};
