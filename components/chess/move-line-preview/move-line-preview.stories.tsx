import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { gameMoves } from "@/lib/chess/game-moves";
import { MoveLinePreview } from "./move-line-preview.comp";

/** Morphy's "Opera game", Paris 1858, in the public domain. */
const OPERA = gameMoves(
  "1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0",
)!;

/** A rook ending that starts from a position, Black to move. */
const FROM_A_POSITION = gameMoves(
  `[FEN "8/8/1k6/8/1PK5/8/8/8 b - - 0 40"]\n[SetUp "1"]\n\n40... Kb7 41. Kc5 Kc7 42. b5 Kb7 43. b6 *`,
)!;

const meta = {
  title: "chess/MoveLinePreview",
  component: MoveLinePreview,
  parameters: {
    docs: {
      description: {
        component: `
A game's moves on one line, as a list of lessons shows them, where pointing at
a move shows the position it leads to on a small board — the new design
system's \`StaticDiagram\`, with the move in amber —, as the engine's lines do
on the analysis board. The board hangs at a fixed place under the start of
the line (above it when there is no room below), does not catch the pointer
and is \`aria-hidden\`: the moves are read as text.

Source: \`components/chess/move-line-preview/move-line-preview.comp.tsx\`.
Reference page: [Components › MoveLinePreview](/components/chess/move-line-preview) in the docs site.
`,
      },
    },
  },
  args: { line: OPERA.line, suffix: OPERA.result },
  argTypes: {
    line: {
      control: "object",
      description: "`GameLine`: `initialFen?` and `plies`, each `{ label, san }` — as written, and as replayed.",
    },
    suffix: { control: "text", description: "Written after the last move, after a «·»: how the game ended." },
    orientation: { control: "inline-radio", options: ["white", "black"], description: "Which side is at the bottom." },
  },
  decorators: [
    // A cell of a list of lessons: as wide as the moves' column, room under it.
    (Story) => (
      <div style={{ width: 420, paddingBottom: 240, fontSize: "var(--platform-type-xs)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MoveLinePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Opera game on one line, cut where the cell ends, with how it ended; nothing pointed at, no board. */
export const Line: Story = {};

/** Pointing at a move: its position on the small board under the line, the move in amber and lit in the line. */
export const PointingAtAMove: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByText("5.Dxf3"));
    await waitFor(() => expect(canvasElement.querySelector(".move-line-preview__board")).not.toBeNull());
  },
};

/** A line that starts from a position with Black to move: «40…Rb7», replayed from that position. */
export const FromAPosition: Story = {
  args: { line: FROM_A_POSITION.line, suffix: undefined },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByText("42.b5"));
    await waitFor(() => expect(canvasElement.querySelector(".move-line-preview__board")).not.toBeNull());
  },
};
