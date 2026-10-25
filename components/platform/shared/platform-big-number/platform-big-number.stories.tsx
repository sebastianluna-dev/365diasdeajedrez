import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SAMPLE_LEVEL_POINTS } from "@/constants/platform/chart-samples.const";
import { PlatformBigNumber } from "./platform-big-number.comp";

const meta = {
  title: "platform/shared/PlatformBigNumber",
  component: PlatformBigNumber,
  parameters: {
    docs: {
      description: {
        component: `
A big thin figure: its label, the integer large in tabular figures, the
decimals and the unit small and grey, a note under it, and optionally its
own series as a sparkline at its right. \`null\` draws a dash.

Source: \`components/platform/shared/platform-big-number/platform-big-number.comp.tsx\`.
Reference page: [Components › PlatformBigNumber](/components/platform/shared/platform-big-number) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0 }}>
        <div className="platform-workspace__panel" style={{ maxWidth: 296 }}>
          <Story />
        </div>
      </div>
    ),
  ],
  args: { label: "Racha de estudio", value: 12, unit: "días", note: "Hoy ya estudiaste · la mejor, 19" },
} satisfies Meta<typeof PlatformBigNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A count with its unit: the streak on the profile's sheet. */
export const WithUnit: Story = {};

/** A share with one decimal: the integer large, «.5 %» small. */
export const WithDecimals: Story = {
  args: {
    label: "Partidas ganadas",
    value: 56.5,
    fractionDigits: 1,
    unit: "%",
    note: "13 de 23 terminadas · 1 en curso",
  },
};

/** An approximate figure with its series beside it: the level against bots. */
export const WithTrend: Story = {
  args: {
    label: "Nivel contra bots",
    value: 850,
    prefix: "≈",
    unit: undefined,
    note: "Aproximado, sobre tus últimas 10 partidas",
    trend: {
      values: SAMPLE_LEVEL_POINTS.map((point) => point.value),
      label: "Nivel contra bots en tus últimas 10 partidas: de ≈ 796 el 13 oct a ≈ 850 el 25 oct",
    },
  },
};

/** No figure yet: a dash, and the note says what is missing. */
export const Empty: Story = {
  args: {
    label: "Nivel contra bots",
    value: null,
    prefix: "≈",
    unit: undefined,
    note: "Faltan 3 partidas terminadas para calcularlo.",
  },
};

/** The smaller size, for a figure inside a block. */
export const Medium: Story = {
  args: { label: "Esta semana", value: 7, unit: "de 7 días", note: "175 min de lecciones", size: "md" },
};
