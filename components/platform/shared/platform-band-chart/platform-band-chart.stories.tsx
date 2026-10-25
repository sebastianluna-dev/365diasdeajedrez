import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SAMPLE_OCTOBER_TOTALS, SAMPLE_SEPTEMBER_TOTALS } from "@/constants/platform/chart-samples.const";
import { PlatformBandChart } from "./platform-band-chart.comp";

const TICKS = [1, 8, 15, 22, 29].map((at) => ({ at, label: at === 1 ? "1 oct" : String(at) }));
const october = SAMPLE_OCTOBER_TOTALS.at(-1) ?? 0;
const september = SAMPLE_SEPTEMBER_TOTALS[SAMPLE_OCTOBER_TOTALS.length - 1] ?? 0;

const meta = {
  title: "platform/shared/PlatformBandChart",
  component: PlatformBandChart,
  parameters: {
    docs: {
      description: {
        component: `
Two running totals and the band between them: this period as a solid blue
line, the one before as a dashed grey one, the stretch between them
hatched, and a marker on this period's last day with the change in a tag.
It stretches to its container's width. One image, named by \`label\`.

Source: \`components/platform/shared/platform-band-chart/platform-band-chart.comp.tsx\`.
Reference page: [Components › PlatformBandChart](/components/platform/shared/platform-band-chart) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0 }}>
        <div className="platform-workspace__panel" style={{ maxWidth: 520 }}>
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    current: SAMPLE_OCTOBER_TOTALS,
    previous: SAMPLE_SEPTEMBER_TOTALS,
    length: 31,
    ticks: TICKS,
    tag: "+12 %",
    label: `Minutos de estudio acumulados: ${october} del 1 al 25 de octubre contra ${september} en los mismos días de septiembre; septiembre cerró con ${SAMPLE_SEPTEMBER_TOTALS.at(-1)}.`,
  },
} satisfies Meta<typeof PlatformBandChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** October so far against all of September: the profile's «Minutos de estudio». */
export const AheadOfLastMonth: Story = {};

/** This period behind the last one: the band lies under the dashed line and the tag says the fall. */
export const Behind: Story = {
  args: {
    current: SAMPLE_OCTOBER_TOTALS.slice(0, 12).map((total) => Math.round(total * 0.6)),
    tag: "−40 %",
    label: "Minutos de estudio acumulados: menos que en los mismos días del mes anterior.",
  },
};

/** The first day of the month: one point, no band yet. */
export const FirstDay: Story = {
  args: { current: SAMPLE_OCTOBER_TOTALS.slice(0, 1), tag: null, label: "Minutos de estudio: el primer día del mes." },
};

/** Nothing studied last month: no band and no tag, only this month's line. */
export const NothingBefore: Story = {
  args: { previous: [], tag: null, label: "Minutos de estudio de este mes; el anterior no tuvo lecciones." },
};
