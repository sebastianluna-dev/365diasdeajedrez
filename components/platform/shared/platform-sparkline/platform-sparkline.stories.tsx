import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SAMPLE_LEVEL_POINTS } from "@/constants/platform/chart-samples.const";
import { PlatformSparkline } from "./platform-sparkline.comp";

const meta = {
  title: "platform/shared/PlatformSparkline",
  component: PlatformSparkline,
  parameters: {
    docs: {
      description: {
        component: `
A mini line beside a figure: the series over its filled area, its last point
marked, no axes and no labels. One image, named by \`label\`; fewer than two
points draw nothing.

Source: \`components/platform/shared/platform-sparkline/platform-sparkline.comp.tsx\`.
Reference page: [Components › PlatformSparkline](/components/platform/shared/platform-sparkline) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0 }}>
        <div className="platform-workspace__panel">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    values: SAMPLE_LEVEL_POINTS.map((point) => point.value),
    label: "Nivel contra bots en las últimas 10 partidas: de ≈ 796 el 13 oct a ≈ 850 el 25 oct",
  },
} satisfies Meta<typeof PlatformSparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The level against bots over ten games, at the size the profile's sheet draws it. */
export const Rising: Story = {};

/** A series that falls: the last point is marked wherever it lands. */
export const Falling: Story = {
  args: { values: [900, 880, 884, 860, 842, 830], label: "De ≈ 900 a ≈ 830 en 6 partidas" },
};

/** Every value the same: a flat line through the middle, not a division by zero. */
export const Flat: Story = {
  args: { values: [800, 800, 800, 800], label: "≈ 800 en las 4 partidas" },
};

/** Larger, as wide as a block's figure leaves room for. */
export const Wide: Story = {
  args: { width: 220, height: 48 },
};
