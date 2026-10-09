import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { FIXTURE_TEAM_BOT, fixtureBotView } from "@/lib/testing/fixtures/bots";
import { BotCard } from "./bot-card.comp";

const meta = {
  title: "platform/sections/play/lobby/BotCard",
  component: BotCard,
  parameters: {
    docs: {
      description: {
        component: `
A bot in the lobby's gallery (J1): its portrait with ring and flag, its title,
its name, «≈ 783» and the record against it. The whole card is the button that
opens the bot's sheet.

Source: \`components/platform/sections/play/lobby/bot-card/bot-card.comp.tsx\`.
Reference page: [Components › BotCard](/components/platform/sections/play/lobby/bot-card) in the docs site.
`,
      },
    },
  },
  args: {
    bot: fixtureBotView(),
    score: { botId: 4, wins: 2, losses: 1, draws: 0, open: 0 },
    onPick: fn().mockName("openSheet"),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 168, padding: "var(--platform-space-3)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BotCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An invented character with a record: two won, one lost, none drawn. */
export const Default: Story = {};

/** Before the first game: «Sin partidas». */
export const NoGames: Story = { args: { score: null } };

/** A game against it still open: «Partida en curso». */
export const OpenGame: Story = { args: { score: { botId: 4, wins: 0, losses: 0, draws: 0, open: 1 } } };

/** A player of a national team: the title before the name and Mexico's three colours around the portrait. */
export const TeamPlayer: Story = { args: { bot: FIXTURE_TEAM_BOT, score: null } };
