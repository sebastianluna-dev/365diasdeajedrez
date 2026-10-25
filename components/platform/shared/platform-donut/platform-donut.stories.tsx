import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformDonut } from "./platform-donut.comp";

const meta = {
  title: "platform/shared/PlatformDonut",
  component: PlatformDonut,
  parameters: {
    docs: {
      description: {
        component: `
A ring of separate segments with round ends and a gap between each: its
first segment hatched with a white tag on it, the legend beside it with each
label's figure. The ring is one image named by \`label\`; the legend is a
list. Each segment's fill is named by what it is (\`hatch\`, \`deep\`,
\`mid\`, \`light\`, \`ink\`, \`neutral\`, \`open\`), never by its colour.

Source: \`components/platform/shared/platform-donut/platform-donut.comp.tsx\`.
Reference page: [Components › PlatformDonut](/components/platform/shared/platform-donut) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0 }}>
        <div className="platform-workspace__panel" style={{ maxWidth: 360 }}>
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    segments: [
      { key: "t0", label: "Táctica", value: 41, tone: "hatch" },
      { key: "t1", label: "Aperturas", value: 18, tone: "deep" },
      { key: "t2", label: "Finales", value: 7, tone: "mid" },
      { key: "t3", label: "Estructuras de peones", value: 4, tone: "light" },
      { key: "t4", label: "Otros", value: 3, tone: "neutral" },
    ],
    label: "De qué trató lo que hiciste este mes: Táctica 41, Aperturas 18, Finales 7, Estructuras de peones 4, Otros 3.",
  },
} satisfies Meta<typeof PlatformDonut>;

export default meta;
type Story = StoryObj<typeof meta>;

/** «Por tema»: what the month was about, the largest hatched with its share. */
export const Topics: Story = {};

/** «Tus intentos»: how the attempts went, the failures in the dark grey. */
export const Attempts: Story = {
  args: {
    segments: [
      { key: "clean", label: "Resueltos", value: 34, tone: "hatch" },
      { key: "hinted", label: "Con pista", value: 6, tone: "mid" },
      { key: "wrong", label: "Fallados", value: 9, tone: "ink" },
      { key: "shown", label: "Viste la solución", value: 3, tone: "neutral" },
    ],
    label: "Tus 52 intentos de ejercicios este mes: 34 resueltos, 6 con pista, 9 fallados y 3 en los que viste la solución.",
  },
};

/** «Tus partidas»: the record, the open game as an outline only, the tag saying the wins of the finished. */
export const Record: Story = {
  args: {
    segments: [
      { key: "win", label: "Ganadas", value: 6, tone: "hatch" },
      { key: "loss", label: "Perdidas", value: 3, tone: "ink" },
      { key: "draw", label: "Tablas", value: 1, tone: "neutral" },
      { key: "open", label: "En curso", value: 1, tone: "open" },
    ],
    tag: "6 de 10",
    label: "Partidas contra los bots este mes: 11, 6 ganadas, 3 perdidas, 1 tablas y 1 en curso.",
  },
};

/** Nothing yet: the ring is a grey track and the legend says the zeros. */
export const Empty: Story = {
  args: {
    segments: [
      { key: "win", label: "Ganadas", value: 0, tone: "hatch" },
      { key: "loss", label: "Perdidas", value: 0, tone: "ink" },
    ],
    label: "Sin partidas este mes.",
  },
};
