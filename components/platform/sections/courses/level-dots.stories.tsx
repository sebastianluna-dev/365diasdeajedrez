import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { DEFAULT_LEVEL } from "@/constants/platform/course-codes.const";
import type { CourseLevelItem } from "@/services/courses/courses.types";
import { formatEloRange } from "@/services/courses/level-rules";
import { LevelDots } from "./level-dots.comp";

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
  title: "platform/sections/courses/LevelDots",
  component: LevelDots,
  parameters: {
    docs: {
      description: {
        component: `
Who a course is for, in the width of a word, next to its name on the catalog's
card: one dot per level of the catalog, lit the ones the course is aimed at,
each in the accent of its difficulty. The tip that names them opens on hover
and on keyboard focus, from the stylesheet alone; a screen reader is given the
same words as the dots' label.

Source: \`components/platform/sections/courses/level-dots.comp.tsx\`.
Reference page: [Components › LevelDots](/components/platform/sections/courses/level-dots) in the docs site.
`,
      },
    },
  },
  args: { scale: LEVELS, levels: levelsOf(DEFAULT_LEVEL.INTERMEDIATE, DEFAULT_LEVEL.ADVANCED) },
  argTypes: {
    scale: { control: "object", description: "Every level of the catalog, the easiest first: one dot each." },
    levels: { control: "object", description: "The levels the course is aimed at: the dots that are lit." },
  },
  // On the card's surface, at its right edge, where `CourseCard` puts them:
  // the tip opens upwards and towards the left.
  decorators: [
    (Story) => (
      <div className="platform-card" style={{ maxWidth: 320, display: "flex", justifyContent: "flex-end" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LevelDots>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A course for two neighbouring levels, «Intermedio» and «Avanzado»: the third and fourth dots lit. */
export const TwoLevels: Story = {};

/** A course for one level, the first: the lightest tone alone. */
export const OneLevel: Story = { args: { levels: levelsOf(DEFAULT_LEVEL.INITIATION) } };

/** A course for the two hardest levels, the darkest tones: its range has no ceiling. */
export const TopLevels: Story = { args: { levels: levelsOf(DEFAULT_LEVEL.EXPERT, DEFAULT_LEVEL.MASTER) } };

/** The tip open, as keyboard focus leaves it: who the course is for and its Elo range. */
export const WithTip: Story = {
  decorators: [
    // Room above the dots for the tip, which in the app opens over the card's cover.
    (Story) => (
      <div style={{ paddingTop: "var(--platform-space-24)" }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const dots = within(canvasElement).getByRole("img");
    await expect(dots).toHaveFocus();
  },
};
