import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DEFAULT_LEVEL } from "@/constants/platform/course-codes.const";
import type { CourseLevelItem } from "@/services/courses/courses.types";
import { formatEloRange } from "@/services/courses/level-rules";
import { LevelScale } from "./level-scale.comp";

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

const meta = {
  title: "platform/sections/courses/course-info/LevelScale",
  component: LevelScale,
  parameters: {
    docs: {
      description: {
        component: `
Who the course is for, on its information page: the scale of the catalog's
levels, one segment each, with the course's lit and the rest greyed, so the
course is placed among all of them and not only named. Above it, the whole
range in one figure. The range guides whoever is choosing; it closes the
course to nobody.

Source: \`components/platform/sections/courses/course-info/level-scale.comp.tsx\`.
Reference page: [Components › LevelScale](/components/platform/sections/courses/course-info/level-scale) in the docs site.
`,
      },
    },
  },
  args: { scale: LEVELS, levels: levelsOf(DEFAULT_LEVEL.INTERMEDIATE, DEFAULT_LEVEL.ADVANCED) },
  argTypes: {
    scale: { control: "object", description: "Every level of the catalog, the easiest first: one segment each." },
    levels: { control: "object", description: "The levels the course is aimed at: the segments that are lit." },
  },
  // On the course's card of `CourseInfoSection`, a white surface: the greyed
  // levels are written in the subtle grey, which is for white surfaces only.
  decorators: [
    (Story) => (
      <div className="platform-card" style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LevelScale>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A course for «Intermedio» and «Avanzado»: two segments lit, and the span they make, «Elo 1200–1999». */
export const TwoLevels: Story = {};

/** A course for one level: one segment lit, and its own range above. */
export const OneLevel: Story = { args: { levels: levelsOf(DEFAULT_LEVEL.BEGINNER) } };

/** A course from the first level: the range is said by where it stops, «Elo menos de 1200». */
export const FromTheStart: Story = {
  args: { levels: levelsOf(DEFAULT_LEVEL.INITIATION, DEFAULT_LEVEL.BEGINNER) },
};

/** A course up to the last level, which has no ceiling: «Elo 2000 o más». */
export const OpenTop: Story = { args: { levels: levelsOf(DEFAULT_LEVEL.EXPERT, DEFAULT_LEVEL.MASTER) } };
