import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GamesSummaryCard } from "./games-summary-card.comp";

const meta = {
  title: "platform/sections/profile/GamesSummaryCard",
  component: GamesSummaryCard,
  parameters: {
    docs: {
      description: {
        component: `
«Partidas» (N5): how many games, and how they went — won, lost, drawn and
still open.

Source: \`components/platform/sections/profile/games-summary-card/games-summary-card.comp.tsx\`.
Reference page: [Components › GamesSummaryCard](/components/platform/sections/profile/games-summary-card) in the docs site.
`,
      },
    },
  },
  args: { record: { wins: 5, losses: 3, draws: 1, open: 1 } },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GamesSummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Ten games: five won, three lost, one drawn, one open. */
export const Default: Story = {};

/** Nothing played yet. */
export const Empty: Story = { args: { record: { wins: 0, losses: 0, draws: 0, open: 0 } } };
