import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BotLevelCard } from "./bot-level-card.comp";

const day = (n: number) => new Date(Date.UTC(2026, 8, n));
const SERIES = [800, 825, 825, 850, 850, 875].map((level, index) => ({ at: day(index + 1), level }));

const meta = {
  title: "platform/sections/profile/BotLevelCard",
  component: BotLevelCard,
  parameters: {
    docs: {
      description: {
        component: `
«Nivel contra bots ≈ 850» (N5): approximate, over the last ten finished games
against bots, with its line. Under five games it says how many are missing
instead of a number nobody can trust. Never a rating.

Source: \`components/platform/sections/profile/bot-level-card/bot-level-card.comp.tsx\`.
Reference page: [Components › BotLevelCard](/components/platform/sections/profile/bot-level-card) in the docs site.
`,
      },
    },
  },
  args: { level: { level: 875, sampleSize: 10, series: SERIES }, isOwn: true },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BotLevelCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On one's own profile, after ten games: ≈ 875 and the line that got there. */
export const WithLevel: Story = {};

/** Three games finished: two more to go. */
export const NotYet: Story = { args: { level: { level: null, sampleSize: 3, series: [] } } };

/** Somebody else's profile without a single game. */
export const NoGames: Story = { args: { level: { level: null, sampleSize: 0, series: [] }, isOwn: false } };
