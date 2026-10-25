import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformPillColumns, type PlatformPillColumn } from "./platform-pill-columns.comp";

const WEEKDAYS = ["jueves", "viernes", "sábado", "domingo", "lunes", "martes", "miércoles"];
const OCTOBER = [20, 25, 0, 30, 15, 20, 35, 25, 20, 0, 10, 25, 30, 15, 25, 20, 30, 35, 20, 25, 25, 30, 20, 35, 30];

/** October 1–25, the 1st and every fifth day named under its column, as the page draws them. */
const OCTOBER_COLUMNS: PlatformPillColumn[] = OCTOBER.map((value, index) => {
  const day = index + 1;
  return {
    key: `2026-10-${String(day).padStart(2, "0")}`,
    axis: day === 1 || day % 5 === 0 ? String(day) : "",
    long: `${WEEKDAYS[index % 7]} ${day}`,
    value,
  };
});

const WEEK_COLUMNS: PlatformPillColumn[] = ["L", "M", "M", "J", "V", "S", "D"].map((axis, index) => ({
  key: `2026-10-${19 + index}`,
  axis,
  long: `${["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"][index]} ${19 + index}`,
  value: [25, 30, 20, 35, 30, 25, 25][index] ?? 0,
}));

const meta = {
  title: "platform/shared/PlatformPillColumns",
  component: PlatformPillColumns,
  parameters: {
    docs: {
      description: {
        component: `
A pill per value: the columns in the neutral grey with a dot on each top,
the one to look at hatched in the primary with its value in a tag over it,
a dot on the axis for a column of nothing and, when given, the daily goal
as a dashed line across with its name at the right. It stretches to its
container's width. One image, named by \`label\` followed by every value.

Source: \`components/platform/shared/platform-pill-columns/platform-pill-columns.comp.tsx\`.
Reference page: [Components › PlatformPillColumns](/components/platform/shared/platform-pill-columns) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0 }}>
        <div className="platform-workspace__panel" style={{ maxWidth: 760 }}>
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    columns: OCTOBER_COLUMNS,
    unit: "min",
    label: "Minutos de estudio cada día, del 1 al 25 de octubre",
    goal: { value: 20, label: "meta 20 min" },
  },
} satisfies Meta<typeof PlatformPillColumns>;

export default meta;
type Story = StoryObj<typeof meta>;

/** «Este mes» on «Estadísticas»: a column a day, today hatched, the daily goal dashed across. */
export const MonthWithGoal: Story = {};

/** «Esta semana»: seven wide columns, each day named by its letter. */
export const Week: Story = {
  args: { columns: WEEK_COLUMNS, label: "Minutos de estudio cada día, del 19 al 25 de octubre" },
};

/** Without a goal: the exercises passed per week, the last eight, with wider columns. */
export const WithoutGoal: Story = {
  args: {
    columns: [9, 11, 10, 13, 12, 10, 11, 12].map((value, index) => ({
      key: `w${index}`,
      axis: `${[31, 7, 14, 21, 28, 5, 12, 19][index]} ${index < 1 ? "ago" : index < 5 ? "sep" : "oct"}`,
      long: `semana ${index + 1}`,
      value,
    })),
    unit: "superados",
    label: "Ejercicios superados por semana, las últimas 8",
    goal: undefined,
    maxColumn: 40,
  },
};

/** A day of nothing as the one to look at: a dot on the axis, and its tag says 0. */
export const TodayEmpty: Story = {
  args: { columns: WEEK_COLUMNS.map((column, index) => (index === 6 ? { ...column, value: 0 } : column)) },
};
