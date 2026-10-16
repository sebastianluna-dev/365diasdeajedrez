import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SeriesProgressTable } from "./series-progress-table.comp";
import type { SeriesProgressData } from "./series-progress-table.types";

/** «Táctica de la semana» given to two students: one through it all, the other halfway with two failures. */
const PROGRESS: SeriesProgressData = {
  items: [
    { exerciseId: "ex000001", n: 1, title: "Mate del pasillo" },
    { exerciseId: "ex000002", n: 2, title: "El mate de Philidor" },
    { exerciseId: "ex000003", n: 3, title: "Mate en una, con negras" },
    { exerciseId: "ex000004", n: 4, title: "El tenedor de caballo" },
    { exerciseId: "ex000005", n: 5, title: "La dama que se entrega" },
  ],
  students: [
    {
      userId: "u-alumno",
      displayName: "Alumno Demo",
      href: "/profesor/alumnos/u-alumno/ejercicios",
      cells: [
        { state: "solved", attempts: 1 },
        { state: "failed", attempts: 1 },
        { state: "solved", attempts: 2 },
        { state: "failed", attempts: 3 },
        { state: "untried", attempts: 0 },
      ],
      solved: 2,
    },
    {
      userId: "u-valentina",
      displayName: "Valentina Cruz",
      href: "/profesor/alumnos/u-valentina/ejercicios",
      cells: [
        { state: "solved", attempts: 1 },
        { state: "solved", attempts: 1 },
        { state: "solved", attempts: 1 },
        { state: "solved", attempts: 2 },
        { state: "solved", attempts: 1 },
      ],
      solved: 5,
    },
  ],
  completed: 1,
};

const meta = {
  title: "platform/shared/SeriesProgressTable",
  component: SeriesProgressTable,
  parameters: {
    docs: {
      description: {
        component: `
Who solved what in a series (D24): a matrix of the students the series
reaches now by its exercises in order — the check for a solve, the cross with
the attempt count for a failure, nothing for one not tried, each with its
words for a screen reader —, «N de M» per student and, above, «Resolvieron N
de M», the students who solved every exercise.

Source: \`components/platform/shared/series-progress-table/series-progress-table.comp.tsx\`.
Reference page: [Components › SeriesProgressTable](/components/platform/shared/series-progress-table) in the docs site.
`,
      },
    },
  },
  args: { progress: PROGRESS },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 760, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SeriesProgressTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two students over five exercises: solved, failed with its count and untried cells, «Resolvieron 1 de 2», and the legend. */
export const MixedCells: Story = { name: "Mixed cells" };

/** A series nobody has yet: the empty state in place of the table. */
export const NoStudents: Story = {
  name: "No students",
  args: { progress: { items: PROGRESS.items, students: [], completed: 0 } },
};
