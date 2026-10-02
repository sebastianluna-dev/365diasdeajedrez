import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import type { DashboardStats, DashboardStatsRange, StatCount } from "@/services/dashboard/dashboard.types";
import { StatsCards } from "./stats-cards.comp";

/** The five metrics, in the catalog's order and with its labels (prisma/seed-data.ts). */
const METRICS = [
  "Lecciones completadas",
  "Cursos completados",
  "Clases asistidas",
  "Partidas analizadas",
  "Ejercicios superados",
];

/** A range as the mapper hands it over: every metric, even at zero, and the topics most practised first. */
function range(counts: number[], topics: [label: string, count: number][]): DashboardStatsRange {
  const totals: StatCount[] = METRICS.map((label, index) => ({ label, count: counts[index] ?? 0 }));
  return { totals, topics: topics.map(([label, count]) => ({ label, count })) };
}

/** A student some months in: every range adds to the one before it. */
const STATS: DashboardStats = {
  week: range(
    [4, 0, 1, 2, 7],
    [
      ["Táctica", 6],
      ["Finales", 3],
      ["Aperturas", 2],
    ],
  ),
  month: range(
    [15, 1, 4, 6, 23],
    [
      ["Táctica", 18],
      ["Finales", 9],
      ["Aperturas", 7],
      ["Estructuras de peones", 4],
      ["Estrategia", 2],
    ],
  ),
  year: range(
    [112, 3, 31, 40, 186],
    [
      ["Táctica", 131],
      ["Finales", 74],
      ["Aperturas", 58],
      ["Estrategia", 41],
      ["Estructuras de peones", 35],
    ],
  ),
  all: range(
    [148, 4, 39, 52, 241],
    [
      ["Táctica", 170],
      ["Finales", 96],
      ["Aperturas", 77],
      ["Estrategia", 53],
      ["Estructuras de peones", 49],
    ],
  ),
};

/** A student who has just arrived: every metric at zero and no topic in any range. */
const NOTHING_YET: DashboardStats = {
  week: range([0, 0, 0, 0, 0], []),
  month: range([0, 0, 0, 0, 0], []),
  year: range([0, 0, 0, 0, 0], []),
  all: range([0, 0, 0, 0, 0], []),
};

/** Chooses a range by its tab, as the student does, and checks the tab says so. */
const choose =
  (label: string) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tab = within(canvasElement).getByRole("tab", { name: label });
    await userEvent.click(tab);
    await expect(tab).toHaveAttribute("aria-selected", "true");
  };

const meta = {
  title: "platform/sections/dashboard/activity-stats/StatsCards",
  component: StatsCards,
  parameters: {
    docs: {
      description: {
        component: `
The dashboard's «Tus estadísticas»: a strip of four tabs — this week, this
month, this year, all time — over one card per metric and a «Por tema» row of
tags, which is left out when the range has no topic. The four ranges arrive
precomputed from \`services/dashboard\`, so choosing one is local state and
fetches nothing; the strip opens on «Esta semana». Each range after the first
has its own story, chosen by its \`play\` function.

Source: \`components/platform/sections/dashboard/activity-stats/stats-cards.comp.tsx\`.
Reference page: [Components › StatsCards](/components/platform/sections/dashboard/activity-stats/stats-cards) in the docs site.
`,
      },
    },
  },
  args: { stats: STATS },
  argTypes: {
    stats: {
      control: "object",
      description:
        "`DashboardStats` from `services/dashboard/dashboard.types`: `{ totals, topics }` for `week`, `month`, `year` and `all`.",
    },
  },
  decorators: [
    // In the app it is the body of the dashboard's card, under its title, at
    // the page's whole width.
    (Story) => (
      <section className="platform-card">
        <h2 className="platform-card__title">Tus estadísticas</h2>
        <Story />
      </section>
    ),
  ],
} satisfies Meta<typeof StatsCards>;

export default meta;
type Story = StoryObj<typeof meta>;

/** «Esta semana», where the strip opens: the five metrics and the three topics practised this week. */
export const ThisWeek: Story = {};

/** «Este mes», chosen by its `play` function: the same cards with the month's figures, and all five topics. */
export const ThisMonth: Story = { play: choose("Este mes") };

/** «Este año», chosen by its `play` function: three-digit figures in the cards. */
export const ThisYear: Story = { play: choose("Este año") };

/** «Todo el tiempo», chosen by its `play` function: everything since the account was created. */
export const AllTime: Story = { play: choose("Todo el tiempo") };

/** A student who has just arrived: every card at zero and no «Por tema» row. */
export const NothingYet: Story = { args: { stats: NOTHING_YET } };
