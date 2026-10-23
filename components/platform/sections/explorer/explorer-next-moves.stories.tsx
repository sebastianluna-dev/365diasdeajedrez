import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { ExplorerNextMove } from "@/services/game-explorer/game-explorer.types";
import { ExplorerNextMoves } from "./explorer-next-moves.comp";

/**
 * The continuations of a position as the service hands them over: most played
 * first, each percentage over the total rounded to one decimal, the same rule
 * as `searchPosition` (so they add up to 100, bar the rounding).
 */
function continuations(counts: [san: string, uci: string, count: number][]): ExplorerNextMove[] {
  const total = counts.reduce((sum, [, , count]) => sum + count, 0);
  return counts.map(([san, uci, count]) => ({
    san,
    uci,
    count,
    percentage: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
  }));
}

/** After 1.e4 e5 2.Nf3, Black to move: the Petrov, the Philidor of Morphy's «Opera Game», the Latvian and a stray. */
const AFTER_KNIGHT_F3 = continuations([
  ["Nc6", "b8c6", 148],
  ["Nf6", "g8f6", 37],
  ["d6", "d7d6", 21],
  ["f5", "f7f5", 6],
  ["Qf6", "d8f6", 1],
]);

/** Stands in for `GameExplorer`'s `playMove`: a spy records the SAN of the row pressed. */
const play = fn().mockName("playMove");

const meta = {
  title: "platform/sections/explorer/ExplorerNextMoves",
  component: ExplorerNextMoves,
  parameters: {
    docs: {
      description: {
        component: `
The «Continuaciones» card of the explorer (the new design system): what was
played from the position on the board and how often, most played first. Each
row is a button that plays its move, with its share drawn as a bar of the
primary's wash behind the text. Here the counts
are made up and \`onPlay\` is a spy listed in the Actions panel.

Source: \`components/platform/sections/explorer/explorer-next-moves.comp.tsx\`.
Reference page: [Components › ExplorerNextMoves](/components/platform/sections/explorer/explorer-next-moves) in the docs site.
`,
      },
    },
  },
  args: { moves: AFTER_KNIGHT_F3, onPlay: play, isSearching: false },
  argTypes: {
    moves: { control: "object", description: "`ExplorerNextMove[]`: `{ uci, san, count, percentage }`, in order." },
    onPlay: { description: "Plays the row's move (its SAN); a spy here." },
    isSearching: { control: "boolean", description: "With no move, «Buscando…» instead of the empty line." },
  },
  decorators: [
    // The explorer's results: the panel's column beside the board.
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExplorerNextMoves>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Five continuations after 1.e4 e5 2.Nf3, in Spanish notation, the bar as wide as each one's share. */
export const Continuations: Story = {};

/** A position only one game went through: a single row, «1 partida», the bar across the whole row. */
export const OneGame: Story = {
  name: "One game",
  args: { moves: continuations([["Nxb8", "d7b8", 1]]) },
};

/** The first query still on its way: no continuation yet, so «Buscando…». */
export const Searching: Story = { args: { moves: [], isSearching: true } };

/** A position no game went on from, such as a mate: «Ninguna partida siguió desde aquí.» */
export const Empty: Story = { args: { moves: [] } };
