import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FIXTURE_BOT, FIXTURE_STUDENT } from "@/lib/testing/fixtures/bots";
import { BotScoreboard } from "./bot-scoreboard.comp";

const meta = {
  title: "chess/BotScoreboard",
  component: BotScoreboard,
  parameters: {
    docs: {
      description: {
        component: `
The record against one rival as a match's scoreboard (H6): the two portraits at
the ends, «2 – 1» large between them, the draws small underneath. Under the
board once a game ends, in the new design system's container.

Source: \`components/chess/bot-scoreboard/bot-scoreboard.comp.tsx\`.
Reference page: [Components › BotScoreboard](/components/chess/bot-scoreboard) in the docs site.
`,
      },
    },
  },
  args: {
    you: FIXTURE_STUDENT,
    rival: FIXTURE_BOT,
    wins: 2,
    losses: 1,
    draws: 1,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420, padding: "var(--platform-space-3)", background: "var(--platform-m3-panel)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BotScoreboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Under the board after a game: two won, one lost, one drawn against Don Chuy. */
export const Default: Story = {};

/** Before the first game against a bot: 0 – 0 and «Primera partida». */
export const FirstGame: Story = { args: { wins: 0, losses: 0, draws: 0 } };
