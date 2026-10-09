import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LevelSparkline } from "./level-sparkline.comp";

const day = (n: number) => new Date(Date.UTC(2026, 8, n));
const RISING = [775, 800, 800, 825, 850, 825, 850, 875, 900, 875, 900, 925].map((level, index) => ({
  at: day(index + 1),
  level,
}));

const meta = {
  title: "platform/sections/profile/LevelSparkline",
  component: LevelSparkline,
  parameters: {
    docs: {
      description: {
        component: `
How the level against bots moved, one point per finished game from the fifth
on: an SVG drawn by hand, no chart library, named in words for a screen
reader («De ≈ 775 a ≈ 925 en 12 partidas»).

Source: \`components/platform/sections/profile/level-sparkline/level-sparkline.comp.tsx\`.
Reference page: [Components › LevelSparkline](/components/platform/sections/profile/level-sparkline) in the docs site.
`,
      },
    },
  },
  args: { points: RISING },
  decorators: [
    (Story) => (
      <div style={{ width: 240, padding: "var(--platform-space-3)", background: "var(--platform-surface)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LevelSparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A level that climbs over twelve games. */
export const Rising: Story = {};

/** Two points only: still a line. */
export const Short: Story = { args: { points: RISING.slice(0, 2) } };
