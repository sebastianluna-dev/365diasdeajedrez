import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FIXTURE_STUDENT, FIXTURE_TEAM_BOT, fixtureBotView } from "@/lib/testing/fixtures/bots";
import { BotSheet } from "./bot-sheet.comp";

const meta = {
  title: "platform/sections/play/lobby/BotSheet",
  component: BotSheet,
  parameters: {
    docs: {
      description: {
        component: `
Who a bot is, at the top of its popup: the portrait, «Elo ≈ 783», how it
plays, its favourite openings, a real player's FIDE facts with their date,
and the scoreboard against it (H6).

Source: \`components/platform/sections/play/lobby/bot-sheet/bot-sheet.comp.tsx\`.
Reference page: [Components › BotSheet](/components/platform/sections/play/lobby/bot-sheet) in the docs site.
`,
      },
    },
  },
  args: { bot: fixtureBotView(), you: FIXTURE_STUDENT, score: { botId: 4, wins: 2, losses: 1, draws: 1, open: 0 } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 432, padding: "var(--platform-space-5) var(--platform-space-6)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BotSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An invented character, with the record against it. */
export const Character: Story = {};

/** A national team's player before the first game: the FIDE facts with their date, and 0 – 0. */
export const TeamPlayer: Story = { args: { bot: FIXTURE_TEAM_BOT, score: null } };
