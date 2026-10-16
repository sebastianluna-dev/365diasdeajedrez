import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { MoveAnnotations } from "@/lib/chess/types";
import { type ChessBoardControlledPosition, ChessBoard } from "./chess-board.comp";

/** Morphy against the Duke of Brunswick and Count Isouard, Paris 1858: the "Opera game", in the public domain. */
const OPERA_GAME = `[Event "Paris"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[White "Morphy, Paul"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

/** Move qualities as the CMS stores them on a teacher's game, keyed `${moveNumber}${"w" | "b"}`. */
const OPERA_ANNOTATIONS: MoveAnnotations = {
  "3b": "inaccuracy",
  "9b": "mistake",
  "10w": "great",
  "13w": "brilliant",
  "16w": "brilliant",
  "17w": "best",
};

/**
 * The Opera game after 16…Cxb8, with what a teacher's `[%cal]` and `[%csl]`
 * would draw: the rook's mate, the bishop that guards d8 and the king it nets.
 */
const BEFORE_THE_MATE: ChessBoardControlledPosition = {
  fen: "1n2kb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2KR4 w k - 0 17",
  lastMove: ["d7", "b8"],
  shapes: [
    { orig: "d1", dest: "d8", brush: "green" },
    { orig: "g5", dest: "d8", brush: "blue" },
    { orig: "e8", brush: "red" },
  ],
};

/** The Opera game's last position: 17.Td8#, Black's king in check. */
const THE_MATE: ChessBoardControlledPosition = {
  fen: "1n1Rkb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2K5 b k - 1 17",
  lastMove: ["d1", "d8"],
  check: true,
};

/** A pawn one step from queening: the move that opens the promotion dialog. */
const PROMOTION_AHEAD: ChessBoardControlledPosition = {
  fen: "8/1P2k3/2K5/8/8/8/8/8 w - - 0 1",
  shapes: [{ orig: "b7", dest: "b8", brush: "green" }],
};

// The viewer's board column grows up to 600px and the trainer's to 560px
// (game-viewer.comp.css, trainer-session.comp.css): a controlled board takes
// whatever width its parent gives it, so it is given that.
const boardColumn: Decorator = (Story) => (
  <div style={{ maxWidth: 560 }}>
    <Story />
  </div>
);

// The standalone board lives on the public site, in the blog article's 700px
// column (article-content.section.css) or beside the home page's text.
const articleColumn: Decorator = (Story) => (
  <div style={{ maxWidth: 700 }}>
    <Story />
  </div>
);

const meta = {
  title: "chess/ChessBoard",
  component: ChessBoard,
  parameters: {
    docs: {
      description: {
        component: `
The board of every game of the app, on the site or in the platform (the only
other chessground is PiecePlacementBoard, which edits a placement). Two modes,
decided by the props given:

- **Controlled** (\`position\`): the parent owns the position and the
  navigation, and only the surface renders. This is how the GameViewer, the
  analysis board, the explorer and the trainer mount it.
- **Standalone** (\`pgn\`): the board replays the PGN and owns the current
  move, with a notation column and a toolbar. This is the board of the home
  page, the mentor page and the blog's game block, all on the public site.

With \`interactive\` the pieces move, validated by chessops, and a pawn that
reaches the last rank opens the board's own promotion dialog. Chessground
ignores synthetic pointer events, so no \`play\` function can make a move:
try the interactive story by hand.

Source: \`components/chess/chess-board.comp.tsx\`.
Reference page: [Components › ChessBoard](/components/chess/chess-board) in the docs site.
`,
      },
    },
  },
  argTypes: {
    pgn: { control: "text", description: "Full PGN or bare SAN movetext. Ignored when `position` is set." },
    position: {
      control: "object",
      description: "Controlled mode: `{ fen, lastMove?, check?, shapes? }`; only the surface renders.",
    },
    flipBoard: { control: "boolean", description: "Black at the bottom." },
    annotations: { control: "object", description: "Move qualities for the standalone notation column." },
    interactive: { control: "boolean", description: "Lets the viewer drag or click legal moves." },
    editableShapes: {
      control: "boolean",
      description: "Lets the viewer draw arrows and circles with the right button.",
    },
    onMove: { description: "Called after a legal interactive move with its SAN and the FEN it was played from." },
    onShapesChange: { description: "Called on release after drawing, with every user shape." },
  },
} satisfies Meta<typeof ChessBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controlled, as the GameViewer mounts it: a position with its last move marked and the teacher's arrows and circle. */
export const Position: Story = {
  args: { position: BEFORE_THE_MATE },
  decorators: [boardColumn],
};

/** Standalone, as the site mounts it: the Opera game from its start, the notation in Spanish with its move qualities, and the toolbar. */
export const Game: Story = {
  args: { pgn: OPERA_GAME, annotations: OPERA_ANNOTATIONS },
  decorators: [articleColumn],
};

/** Standalone at the last move, by its `play` function («Ir al final»): the mate's cell active and the king in check. */
export const GameAtTheEnd: Story = {
  args: { pgn: OPERA_GAME, annotations: OPERA_ANNOTATIONS },
  decorators: [articleColumn],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Ir al final" }));
    // `hidden`: under 768px the stylesheet hides the notation, and the board still goes to the end.
    await expect(canvas.getByRole("button", { name: /d8#/, hidden: true })).toHaveClass(
      "chess-board__notation-cell_active",
    );
  },
};

/** Flipped, Black at the bottom, as the trainer shows a line played with Black: the mate, the checked king in red. */
export const Flipped: Story = {
  args: { position: THE_MATE, flipBoard: true },
  decorators: [boardColumn],
};

/** Interactive with editable shapes, as the analysis editor mounts it: drag the pawn to b8 and the promotion dialog opens; the parent owns the position, so after the move the board goes back to it. */
export const Interactive: Story = {
  args: {
    position: PROMOTION_AHEAD,
    interactive: true,
    editableShapes: true,
    onMove: fn().mockName("onMove"),
    onShapesChange: fn().mockName("onShapesChange"),
  },
  decorators: [boardColumn],
};

/** An exercise's «Pista» without a text (`hintSquare`): the white queen on h5, the piece to move, circled. */
export const Hint: Story = {
  args: {
    position: { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4" },
    hintSquare: "h5",
    interactive: true,
  },
  decorators: [boardColumn],
};

/** An exercise's wrong move (`lastMoveTone="error"`): Qxe5+ played instead of the mate, its two squares in the danger colour for the moment before it is taken back. */
export const WrongMove: Story = {
  args: {
    position: {
      fen: "r1bqkb1r/pppp1ppp/2n2n2/4Q3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
      lastMove: ["h5", "e5"],
      check: true,
    },
    lastMoveTone: "error",
  },
  decorators: [boardColumn],
};
