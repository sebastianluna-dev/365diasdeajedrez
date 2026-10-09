import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fixturePlayedGames } from "@/lib/testing/fixtures/bots";
import { PlayedGameCard } from "./played-game-card.comp";

const NOW = new Date("2026-10-08T18:00:00Z");
const [OPEN, WON, LOST, DRAWN] = fixturePlayedGames(NOW);

const meta = {
  title: "platform/shared/PlayedGameCard",
  component: PlayedGameCard,
  parameters: {
    docs: {
      description: {
        component: `
A played game as a card (L2): the final position from the person's side with
the result in a corner («G», «P», «T», «En curso», «Anulada»), the rival and a
line of facts. The whole card opens the game. The profile and the teacher's
page of a student show the last eight.

Source: \`components/platform/shared/played-game-card/played-game-card.comp.tsx\`.
Reference page: [Components › PlayedGameCard](/components/platform/shared/played-game-card) in the docs site.
`,
      },
    },
  },
  args: { game: WON!, now: NOW },
  decorators: [
    (Story) => (
      <div style={{ width: 240, padding: "var(--platform-space-3)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayedGameCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Won by mate against Tere: «G» in the success's colour. */
export const Won: Story = {};

/** Lost by abandonment, with Black: the board from Black's side, «P» in red. */
export const Lost: Story = { args: { game: LOST! } };

/** A draw by repetition: «T» in grey. */
export const Drawn: Story = { args: { game: DRAWN! } };

/** Still open: «En curso», and the card goes on with the game. */
export const Open: Story = { args: { game: OPEN! } };
