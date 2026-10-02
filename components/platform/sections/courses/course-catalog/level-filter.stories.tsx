import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DEFAULT_LEVEL } from "@/constants/platform/course-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { CourseLevelItem } from "@/services/courses/courses.types";
import { formatEloRange } from "@/services/courses/level-rules";
import { LevelFilter } from "./level-filter.comp";

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

const meta = {
  title: "platform/sections/courses/course-catalog/LevelFilter",
  component: LevelFilter,
  parameters: {
    nextjs: { navigation: { pathname: platformRoutes.courseCatalog } },
    docs: {
      description: {
        component: `
The level filter of «Explorar cursos»: «Todos» and one chip per level, in order
of difficulty, each with its orientative Elo range, and under them the note
that the Elo guides. Links and not buttons: the level lives in the URL
(\`?nivel=intermedio\`), which the page reads and passes down as \`current\`;
the chip of that level is the active one and carries \`aria-current="page"\`.

Source: \`components/platform/sections/courses/course-catalog/level-filter.comp.tsx\`.
Reference page: [Components › LevelFilter](/components/platform/sections/courses/course-catalog/level-filter) in the docs site.
`,
      },
    },
  },
  args: { levels: LEVELS },
  argTypes: {
    levels: { control: "object", description: "The levels in use, the easiest first." },
    current: {
      // "" stands for the absent prop: the component treats both alike.
      control: { type: "select", labels: { "": "(none)" } },
      options: ["", ...LEVELS.map((item) => item.slug)],
      description: "Slug of the level the list is narrowed to; absent, «Todos» is the active chip.",
      table: { type: { summary: "string" } },
    },
  },
  // The catalog's column: the page is 960px wide.
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 960 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LevelFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The catalog as it opens, `/cursos/explorar`: no level in the URL, so «Todos» is the active chip. */
export const AllCourses: Story = {};

/** `/cursos/explorar?nivel=intermedio`: the page passes the level on and its chip is the active one. */
export const LevelChosen: Story = {
  args: { current: DEFAULT_LEVEL.INTERMEDIATE },
  parameters: {
    nextjs: {
      navigation: { pathname: platformRoutes.courseCatalog, query: { nivel: DEFAULT_LEVEL.INTERMEDIATE } },
    },
  },
};

/** In a phone's width the chips wrap onto rows, and the note stays under them. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};
