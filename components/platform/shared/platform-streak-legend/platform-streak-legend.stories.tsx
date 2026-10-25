import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlatformStreakLegend } from "./platform-streak-legend.comp";

const meta = {
  title: "platform/shared/PlatformStreakLegend",
  component: PlatformStreakLegend,
  parameters: {
    docs: {
      description: {
        component: `
«Menos ● ● ● ● Más»: the four depths of the streak's calendar, for beside
it. Decorative, hidden from a screen reader: the calendar's label says the
data.

Source: \`components/platform/shared/platform-streak-legend/platform-streak-legend.comp.tsx\`.
Reference page: [Components › PlatformStreakLegend](/components/platform/shared/platform-streak-legend) in the docs site.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="platform-workspace" style={{ minHeight: 0 }}>
        <div className="platform-workspace__panel" style={{ background: "var(--platform-m3-container)" }}>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof PlatformStreakLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The four depths, a grey speck and three blues, between «Menos» and «Más». */
export const Default: Story = {};
