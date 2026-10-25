import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SAMPLE_BOT_BARS } from "@/constants/platform/chart-samples.const";
import { PlatformCompareBars } from "./platform-compare-bars.comp";

const meta = {
  title: "platform/shared/PlatformCompareBars",
  component: PlatformCompareBars,
  parameters: {
    docs: {
      description: {
        component: `
Columns side by side with their figure inside the top: each as tall as its
value against the largest, its name and caption under it, one highlighted
in the primary. One image, named by \`label\`.

Source: \`components/platform/shared/platform-compare-bars/platform-compare-bars.comp.tsx\`.
Reference page: [Components › PlatformCompareBars](/components/platform/shared/platform-compare-bars) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0 }}>
        <div className="platform-workspace__panel" style={{ maxWidth: 560 }}>
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    bars: SAMPLE_BOT_BARS,
    label:
      "Partidas contra cada bot: Beto (547) 4: 4 ganadas, 0 perdidas, 0 tablas; Lupita (668) 5: 4 ganadas, 1 perdida, 0 tablas; Don Chuy (783) 6: 3 ganadas, 2 perdidas, 1 tablas; Mariana (891) 7: 2 ganadas, 3 perdidas, 1 tablas, 1 en curso; Profe Ramírez (1036) 2: 0 ganadas, 2 perdidas, 0 tablas.",
  },
} satisfies Meta<typeof PlatformCompareBars>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The record against each bot, Mariana highlighted for the game still open. */
export const Highlighted: Story = {};

/** None highlighted: every column the same grey. */
export const Plain: Story = {
  args: { bars: SAMPLE_BOT_BARS.map((bar) => ({ ...bar, highlighted: false })) },
};

/** One column only. */
export const Single: Story = {
  args: { bars: SAMPLE_BOT_BARS.slice(0, 1), label: "Partidas contra Beto: 4, todas ganadas." },
};

/** Taller, for a block with more room. */
export const Tall: Story = {
  args: { height: 210 },
};
